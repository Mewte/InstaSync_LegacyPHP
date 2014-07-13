var cluster = require('cluster');
var os = require('os');
if (cluster.isMaster) {
	var request  =  require('request');
	var fs = require('fs');
	var commandQueue = require("./commandQueue");
	var room = require("./room");
	var commands = require("./commands");
	var parser = require("./parsers");
	var crypto = require('crypto');
	//var port = process.env.port;
	var port = 38000;
	process.on('uncaughtException', function (error) {
		console.log("UNHANDLED ERROR! Logged to file.");
		fs.appendFile("crashlog.txt", error.stack + "---END OF ERROR----", function(){});
	});
	var connect = require('connect');
	var app = connect(function(req, res) {res.writeHead(404); res.end("No resource found.");}).listen(port);
	global.chat_room = require('socket.io').listen(app, {"log level": 2, "heartbeat timeout": 20, "heartbeat interval": 5, "close timeout": 20, "transports": ['websocket','htmlfile', 'xhr-polling', 'jsonp-polling'], 'polling duration': 10});

	//global.phploc = "http://127.0.0.1/";
	global.phploc = "http://dev.instasynch.com/";
	global.iptable = new Object();
	global.rooms = new Array();

	function getSocket(msg)
	{
		//build socket (for compatibility with old JS files)
		var socket = chat_room.sockets.socket(msg.id);
		if (socket.connected == undefined){
			socket.connected = true; //only if undefined, i.e. not false
		}
		return socket;
	}
	function socketMessage(msg)
	{
		var socket = getSocket(msg);
		switch(msg.type)
		{
			case "join":
				join(socket, msg.data.username, msg.data.cookie, msg.data.room);
				break;
			case "rename":
				rename(socket, msg.data.username);
				break;
			case "disconnect":
				disconnect(socket);
				break;
			case "chat":
				message(socket, msg.data.message);
				break;
			case "command":
				command(socket, msg.data.data);
				break;
		}
	}
	function messageSocket(msg) { //master passes single socket emits via this.
		switch (msg.type)
		{
			case "emit":
				chat_room.sockets.socket(msg.id).emit(msg.event, msg.data);
				break;
			case "broadcast":
				chat_room.sockets.socket(msg.id).broadcast.to(msg.room).emit(msg.event, msg.data);
				break;
			case "disconnect": //handles disconnect for xhr pollers
				chat_room.sockets.socket(msg.id).emit('request-disconnect');
				setTimeout(function() //give socket a small delay to disconnect itself before we force boot it
				{
					chat_room.sockets.socket(msg.id).disconnect();
				}, 500);
				break;
		}
	};
	function join(socket, username, cookie, roomname){
		if (!socket.joined)
		{
			roomname = roomname.toLowerCase();
			if (rooms[roomname] == undefined) //room not in memory
			{
				request.post(phploc + 'data/roominfo.php', {form:{ room: roomname}}, function(e, r, msg)     
				{
					try {var result = JSON.parse(msg)} catch(e) {console.log("Room JSON not valid?"); return;}
					if (result.error == undefined )
					{
						if (rooms[roomname] == undefined) //check to be sure the room is still undefined
						{
							rooms[roomname] = room.create(roomname);
							socket.emit('sys-message', { message: "Room loaded into memory, refresh page."});
							socket.attemptDisconnect();
						}
						else
						{
							socket.emit('sys-message', { message: "Room is stil loading, refresh page."});
							socket.attemptDisconnect();
						}
					}
					else
					{
						socket.emit('sys-message', { message: "This roomname does not exist."});
						socket.attemptDisconnect();
					}
				});              
			}
			else //room in memory
			{
				var socketIp = "";
				try {(socketIp = socket.manager.handshaken[socket.id].address.address);} catch (e) {console.log("Error with socket IP address"); return;}
				request.post(phploc + 'data/parseuser.php', {form:{username: username, cookie: cookie, ip: socketIp, 
																   room: roomname}}, function(e, r, msg)     
				{
					//data to send back from php file: username, permissions, class, style
					if (socket.connected == false) //if the socket disconnected by the time this runs, stop
						return;
					try {var response = JSON.parse(msg); } catch(ex) {console.log("JSON from parseuser.php not valid?" + e +"response:"+ msg); return;}
					if (response.error)
					{
						socket.emit('sys-message', {message: response.error});
						socket.attemptDisconnect();
					}
					else
					{     
						var user = response.user;
						var hashedIp = crypto.createHash('md5').update("Random Salt Value: $33x!20" + socketIp).digest("hex").substring(0, 11);
						socket.info = {username: user.username, permissions: user.permissions, room: roomname, 
									   loggedin: user.loggedin, ip: socketIp, hashedIp: hashedIp,
									   skipped: false, voteinfo: {voted: false, option: null}};
						if (rooms[socket.info.room] != undefined)
						{
							rooms[socket.info.room].tryJoin(socket);
						}
					}
				});
			}
		}
	}
	function rename(socket, newUsername){
		if (socket.joined)
		{
			if (socket.info.username == "unnamed")
			{
				rooms[socket.info.room].rename(socket, newUsername);
			}
		}
	}
	function disconnect(socket){
		socket.connected = false;
		if (socket.joined)
		{
			if (rooms[socket.info.room] != undefined)
            {
                rooms[socket.info.room].leave(socket);
            }
		}
		//socket.disconnect(); //causes error..?
	}
	function message(socket, message){
		if (socket.joined && socket.info.username.toLowerCase() != "unnamed")
		{
			rooms[socket.info.room].chatmessage(socket, parser.replaceTags(message));
		}
	}
	function command(socket, data){
		if (data.command != undefined && commands.commands[data.command] !=  undefined && socket.joined)
		{
			if (data.data !== undefined) //TODO: Check if data is not null for certain commands
			{
				if (data.data === null)
				{
					data.data = {}; //help prevent crash when null is sent but needed. 
					//commands.js will see this as an object and thus .property will trigger the undefined checks
				}
				commands.commands[data.command](data.data, socket);
			}
		}		
	}
	var iptable = new Object();
	chat_room.sockets.on('connection', function(socket) {
		console.log('connection from server listening on: '+ port);
		socket.attemptDisconnect = function(){
			if (socket.joined)
			{
				socket.leave(socket.info.room); //unsubscribe user from room immediately
			}
			messageSocket({type: "disconnect", id: socket.id});
		};		
		//get IP
		var ip = "";
		//Fixes rare error that happened from time to time
        try {ip = socket.manager.handshaken[socket.id].address.address} catch (e) {console.log("Error with socket IP address"); socket.emit("request-disconnect"); socket.attemptDisconnect(); return;}
		//var ip = req.header('x-forwarded-for') || req.connection.remoteAddress; when using reverse proxy
	
		//Max IP connected to this worker logic
		if (iptable[ip] != undefined)
        {
            if (iptable[ip] > 5)
            {
				console.log("Max users online with IP:"+ip);
                socket.emit('sys-message', { message: "Max users online with this IP."});
				socket.emit("request-disconnect");
				socket.attemptDisconnect();	
                return;
            }
            else
            {
                iptable[ip]++; 
            }
        }
        else
        {
            iptable[ip] = 1;
        }
		var joinEmitted = false;
		socket.on('join', function(data)
		{
			if (joinEmitted == false)
			{// this is a one time emit per socket connection
				if (data.username != undefined && data.cookie != undefined && data.room != undefined)
				{
					socketMessage({type: "join", id: socket.id, data: {username: data.username, cookie: data.cookie, room: data.room}});
				}
			}
			joinEmitted = true;
		});
		var renameEmitted = false;
		socket.on('rename', function(data)
		{
			if (data.username != undefined && data.username.toLowerCase() != "unnamed" && renameEmitted == false)
			{
				if (data.username.toLowerCase() == "mewte")
				{
					socket.emit("sys-message", {message: "b-but you are not Mewte...<img src='/images/notsure.jpg' width='50' height='50' >"});
				}
				else
				{
					socketMessage({type: "rename", id: socket.id, data: {username: data.username}});
					renameEmitted = true;
				}
			}
		});
		socket.on('disconnect', function(data)
		{
			iptable[ip]--;
			if (iptable[ip] === 0)
			{
				delete iptable[ip];
			}
			socketMessage({type: "disconnect", id: socket.id});
		});
		
		var currentCharacters = 0; 
		var currentMessages = 0;
		var reduceMsgInterval = null; //reduce messages by 1 and characters by 100 every second
		socket.on('message', function(data)
		{
			if ((data.message != undefined) && (data.message.trim() != "")){
				//increment message limits
				currentCharacters += data.message.length;
				currentMessages += 1;
				
				if (currentCharacters > 260 || currentMessages > 3)
				{
					socket.emit("sys-message", {message: "Please don't spam/flood the chat."});
					currentCharacters = Math.min(600, currentCharacters);
					currentMessages = Math.min(6, currentMessages);
				}
				else
				{      
					lastMessage = data.message;
					socketMessage({type: "chat", id: socket.id, data: {message: data.message}});
				}
				if (reduceMsgInterval === null)
				{
					reduceMsgInterval = setInterval(
					function(){
						currentCharacters -= 60;
						currentMessages -= 1;
						currentCharacters = Math.max(0, currentCharacters);
						currentMessages = Math.max(0, currentMessages);
						if (currentCharacters == 0 && currentMessages == 0)
						{
							clearInterval(reduceMsgInterval);
							reduceMsgInterval = null;
						}     
					},1000);
				}
			}			
			
		});
		var queue = commandQueue.create(6);
		socket.on('command', function(data)
		{
			queue.addCommand();
			if (queue.checkFlood()) //too many commands
			{
				socket.emit('sys-message', { message: "Too many commands. Disconnected."});
				socket.emit("request-disconnect");
				socket.disconnect();
				return;
			}
			if (joinEmitted){
				socketMessage({type: "command", id: socket.id, data: {data: data}});
			}
		});
	});
}
else{
	//Just some reverse proxy stuff we experimented with. Works breddy good.
	var http = require('http');
	var httpProxy = require('http-proxy');
	var crypto = require('crypto'); 
	var url  = require('url');
	
	var server1 = cluster.fork({port: 38001});
	var server2 = cluster.fork({port: 38002});
	
	var servers = [
		38001, 38002
	];
	
	var proxy = new httpProxy.createProxyServer();
	proxy.on('error', function(){
		console.log('error');
	});
	proxy.on('proxyRes', function (res) {
	  console.log('RAW Response from the target', JSON.stringify(res.headers, true, 2));
	});	
	var proxyServer = http.createServer(function (req, res) {
		var url_parts = url.parse(req.url, true);
		var room = url_parts.query['room'];
		if (room === undefined){
			res.writeHead(404); 
			res.end("Missing room parameter.");
		}
		else{
			req.headers['x-forwarded-for'] = req.connection.remoteAddress;
			var serverNumber = parseInt(crypto.createHash('md5').update(room).digest("hex").substring(1, 10),16) % 2;
			console.log(serverNumber);
			proxy.web(req, res, {target: {
									host: 'localhost',
									port: servers[serverNumber]
									}});			
		}
	});	
	proxyServer.on('upgrade', function (req, socket, head) {
		var url_parts = url.parse(req.url, true);
		var room = url_parts.query['room'];
		if (room === undefined){
			//socket.close();
		}
		else{
			req.headers['x-forwarded-for'] = req.connection.remoteAddress;
			var serverNumber = parseInt(crypto.createHash('md5').update(room).digest("hex").substring(1, 10),16) % 2;
			console.log(serverNumber);
			proxy.ws(req, socket, head, {target: {
									host: 'localhost',
									port: servers[serverNumber],
									ws: true}});			
		}
	});
	proxyServer.listen(38000);
}