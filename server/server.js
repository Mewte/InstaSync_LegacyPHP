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
	var server = require('http').createServer();
	var RedisStore = require('socket.io/lib/stores/redis');
	var redis = require('socket.io/node_modules/redis');
	global.chat_room = require('socket.io').listen(server);
	global.chat_room.set('store', new RedisStore({
		redisPub: redis.createClient(),
		redisSub: redis.createClient(),
		redisClient: redis.createClient()
	}));
	process.on('uncaughtException', function (error) {
		console.log("UNHANDLED ERROR! Logged to file.");
		fs.appendFile("crashlog.txt", error.stack + "---END OF ERROR----");
		console.log("line 23: "+error.stack);
	});
	
	global.phploc = "http://127.0.0.1/";
	
	global.iptable = new Object();
	global.rooms = new Array();
	global.workerMap = new Object(); //store workers here to pass back socket emit to worker process to handle it
	
	var workerToSocketsMap = new Object(); //TODO: if worker dies, use this to remove the users from the rooms they were in.
	
	/*
	 * Node.JS round robin doesn't like to assign ports 'randomly' but seems to 
	 * stick to one worker. The problem with this is if the server restarts, 
	 * chances are a socket will reconnect to a new worker. This causes 'client
	 * not handshake, should reconnect' error.
	 * New Method: Assign ports manually using javascript to randomize port number
	 * to create a more random round robin load balancing. Also insures that
	 * during reconnect, socket will connect to the same worker that was handling it
	 * which is also useful for short polling too.
	 */
	createWorker(38000);
	createWorker(38001);
	createWorker(38002);
	createWorker(38003);
	
	function createWorker(port)
	{
		var worker = cluster.fork({port: port});
		workerMap[worker.id] = worker;
		worker.on('message', function(msg) //gateway for various messages
		{
			onMessage(msg);
		});
	}
	/*
	 * Takes message from onMessage and turns it into a complete socket for 
	 * compatability and minimal modification to commands.js and room.js
	 */
	function getSocket(msg)
	{
		//build socket (for compatibility with old JS files)
		var socket = chat_room.sockets.socket(msg.id);
		if (socket.connected == undefined){
			socket.connected = true; //only if undefined, i.e. not false
		}
		socket.workerId = msg.workerId;
		//--------
		//replace regular emit with new emit (that sends message to child process instead
		socket.emit = function(event, data)
		{
			workerMap[socket.workerId].send({type: "emit", id: msg.id, event: event, data: data});
		};
		socket.disconnect = function(){
			if (socket.joined)
			{
				socket.leave(socket.info.room); //unsubscribe user from room immediately
			}
			workerMap[socket.workerId].send({type: "disconnect", id: msg.id});
		};
		socket.broadcastToRoom = function(room, event, data) //custom broadcast
		{
			workerMap[socket.workerId].send({type: "broadcast", id: msg.id, event: event, data: data, room: room});
		};
		//-------
		return socket;
	}
	function onMessage(msg)
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
							socket.disconnect();
						}
						else
						{
							socket.emit('sys-message', { message: "Room is stil loading, refresh page."});
							socket.disconnect();
						}
					}
					else
					{
						socket.emit('sys-message', { message: "This roomname does not exist."});
						socket.disconnect();
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
					try {var user = JSON.parse(msg)} catch(e) {console.log("JSON from parseuser.php not valid?" + msg); return;}
					if (user.error != "none")
					{
						socket.emit('sys-message', {message: user.error});
						socket.disconnect();
					}
					else
					{     
						var hashedIp = crypto.createHash('md5').update("Random Salt Value: $33x!20" + socketIp).digest("hex").substring(0, 11);
						socket.info = {username: user.username, permissions: user.permissions, room: user.room, 
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
		socket.disconnect(); //remove socket from clients memory in master
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
				commands.commands[data.command](data.data, socket);
		}		
	}
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died!!!! RECOMEND SERVER RESTART.');
		//createWorker();
	}); 
}

if (cluster.isWorker) {
	var connect = require('connect');
	var port = process.env.port;
	console.log("Worker ID: "+cluster.worker.id+" listening on port: " + port);
	var app = connect(function(req, res) {res.writeHead(404); res.end("No resource found.");}).listen(port);
	var io = require('socket.io').listen(app, {"log level": 2, "heartbeat timeout": 20, "heartbeat interval": 5, "close timeout": 20, "transports": ['websocket','htmlfile', 'xhr-polling', 'jsonp-polling'], 'polling duration': 10});
	var RedisStore = require('socket.io/lib/stores/redis');
	var redis = require('socket.io/node_modules/redis');
	var commandQueue = require("./commandQueue");
	io.set('store', new RedisStore({
		redisPub: redis.createClient(),
		redisSub: redis.createClient(),
		redisClient: redis.createClient()
	}));
	process.on('uncaughtException', function (error) {
		console.log(error.stack);
	});
	var iptable = new Object();
	io.sockets.on('connection', function(socket) {
		//get IP
		console.log("Connected to worker: "+cluster.worker.id);
		var ip = "";
		//Fixes rare error that happened from time to time
        try {ip = socket.manager.handshaken[socket.id].address.address} catch (e) {console.log("Error with socket IP address"); socket.emit("request-disconnect"); socket.disconnect(); return;}
		//Max IP connected to this worker logic
		if (iptable[ip] != undefined)
        {
            if (iptable[ip] > 100)
            {
				console.log("Max users online with IP:"+ip);
                socket.emit('sys-message', { message: "Max users online with this IP."});
				socket.emit("request-disconnect");
                socket.disconnect();
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
					process.send({type: "join", id: socket.id, workerId: cluster.worker.id, data: {username: data.username, cookie: data.cookie, room: data.room}});
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
					process.send({type: "rename", id: socket.id, workerId: cluster.worker.id, data: {username: data.username}});
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
			process.send({type: "disconnect", id: socket.id, workerId: cluster.worker.id});
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
					process.send({type: "chat", id: socket.id, workerId: cluster.worker.id, data: {message: data.message}});
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
		var queue = commandQueue.create(4);
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
				process.send({type: "command", id: socket.id, workerId: cluster.worker.id, data: {data: data}});
			}
		});
	});

	process.on('message', function(msg) { //master passes single socket emits via this.
		switch (msg.type)
		{
			case "emit":
				io.sockets.socket(msg.id).emit(msg.event, msg.data);
				break;
			case "broadcast":
				io.sockets.socket(msg.id).broadcast.to(msg.room).emit(msg.event, msg.data);
				break;
			case "disconnect":
				io.sockets.socket(msg.id).emit('request-disconnect');
				setTimeout(function() //give socket a small delay to disconnect itself before we force boot it
				{
					io.sockets.socket(msg.id).disconnect();
				}, 500);
				break;
		}
	});
}