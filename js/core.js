/*
    <InstaSynch - Watch Videos with friends.>
    Copyright (C) 2013  InstaSynch
*/
//I.E. <10 doesn't support console.log
if( window.console == undefined) {
	window.console = {log: function()
		{
			//do nothing
		}
	};
}
var global = new Object();
global.requestPartialPage = null;
global.loadRoomObj = null;
global.page = new Object();
global.page = {title: null, url: null, name: null, room: null};
global.sendcmd = null;
var video = null;

//socket events mainly used for the connection status dialog box
global.onConnecting = function(){
	
};
global.onConnected = function(){
	global.reconnectAttempt = 1;
};
global.onJoining = function(){
	showConnectionBox("Joining..");
};
global.onJoined = function(){
	$("#chat").switchClass("inactive", "active", 1200);
	hideConnectionBox();
};
global.reconnectAttempt = 1;
global.onReconnecting = function(){
	$("#chat").switchClass("active", "inactive", 1200);
	showConnectionBox("Reconnecting.. Attempt " + global.reconnectAttempt);
	global.reconnectAttempt++;
};
global.onReconnect = function(){
	addMessage({username: ""}, "Reconnected to chat server.", "system");
};
global.reconnectFailed = function(){
	showConnectionBox("Reconnect failed.");
};
global.onError = function(){
	showConnectionBox("Could not connect to server.");
};
global.onDisconnect = function(){
	showConnectionBox("Disconnected from server.");
};

$(function (){
window.onpopstate = function(event) {
	global.requestPartialPage(event.state.name, event.state.room, true);
};
$(document).ready(function(){
	//mark this current page load in the history state (so we can come back to it if the user presses back)
	//use replaceState so that the state is saved into the history.state object, but doesn't push the entry into history
	if (history.state == undefined)
	{
		try{ //only html5 browsers support this
		history.replaceState(global.page, global.page.title, global.page.url);
		}
		catch (e)
		{
			//not supported
		}
	}
	document.title = global.page.title;
});
global.requestPartialPage = function(name, room, back)
{
	$("#partialPage").empty();
	$("#partialPage").load("/partials/" + name + ".partial.php" + "?room="+room+"&nocache="+new Date().getTime(), function()
	{
		if (back !== true) //not going back, so push a new state
		{
			if (JSON.stringify(history.state) != JSON.stringify(global.page)) //not the same page
			{
				history.pushState(global.page, global.page.title, global.page.url);
			}
		}	
		document.title = global.page.title;
	});
};
global.loadRoomObj = loadRoom;
function loadRoom() {
    var room = new webSocket();
	global.sendcmd = room.sendcmd;
	video = new player("media");
	var queue = null; //stores resynch limiter timeout
	function requestResynch(){
		console.log("Resynch requested..");
		if (queue === null && autosynch){
			queue = setTimeout(function() //prevent to many resynchs
			{
				console.log("Resynch request sent.");
				global.sendcmd("resynch", null);
				queue = null;
			}, 1000);
		}
	}
	video.on["userSeeked"] = function(time){
		if (isLeader){
			global.sendcmd('seekto', {time: time});
		}
		else
			requestResynch();
	};
	video.on["userPlayed"] = function(){
		if (isLeader){
			global.sendcmd('resume', null);
		}
		else{//resynch
			requestResynch();
		}
	};
	video.on["userPaused"] = function(){
		if (isLeader){
			global.sendcmd('pause', null);
		}		
	};
	video.on['resynchNeeded'] = function(){ //trigger this if a resynch is needed? perhaps after a buffer?
		requestResynch();
	};
	messages = 0;
	detectIE();

    var join = function () 
    {
        if (validateJoin($('#join-username').val())) 
        {
            room.rename($('#join-username').val());
        } 
        else 
        {
            $('#join-username').val('');
        }
    };
    function validateJoin(username) 
    {
        if (username == '') 
        {
            return false;
        }
        if (username['match'](/^([A-Za-z0-9]|([-_](?![-_]))){1,16}$/) != null) 
        {
            for (var i = 0; i < users['length']; i++) 
            {
                if (username['toLowerCase']() == users[i]['username']['toLowerCase']()) 
                {
                    alert('Name in use.');
                    return false;
                }
            }
            return true;
        } 
        else 
        {
            alert('Input was not a-z, A-Z, 1-16 characters.');
            return false;
        }
    }
    $(document).ready(function () 
    {      
        $('#addUrl').click(function () {
            var url = $('#URLinput').val();
            if ($('#URLinput').val().trim() != '')
            {
                room.sendcmd('add', {URL: url});
            }
            $('#URLinput').val('');
        });
        $('#toggleplaylistlock').click(function () {
            room.sendcmd('toggleplaylistlock', null);
        });
        $('#join').click(function () {
            join();
        });
        $('#skip').click(function () {
            if (userInfo.loggedin)
                room.sendcmd('skip', null);
            else
                addMessage({username: ""},"You must be logged in to vote to skip.","errortext");
        });
        $('#resynch').click(function () {
            room.sendcmd('resynch', null);
        });
		$("#toggleYTcontrols").click(function(){
			showYTcontrols = !showYTcontrols;
            video.destroy();
            room.sendcmd('reload', null);			
		});
        $('#reload').click(function () {
            video.destroy();
            room.sendcmd('reload', null);
        });
        $('#cin')['focus'](function () {
            document.title = global.page.title;
            newMsg = false;
        });
        $('#ban').click(function () {
           room.sendcmd('ban', { userid: $(this)['data']('id')});
        });
        $('#kick').click(function () {
           room.sendcmd('kick', {userid: $(this)['data']('id') });
        });
        //POLL STUFF
        $(".close-poll").click(function()
        {
           room.sendcmd("poll-end", null)
        });
        $("#add-option").click(function()
        {
            $('<input/>',{
            'class':'formbox create-poll-option',
            'placeholder':'Option'}).insertBefore($(this)); 
            $('<br>',{}).insertBefore($(this));
        })
        $("#submit-poll").click(function()
        {
            var poll = new Object();
            poll.title = $("#title").val();
            poll.options = new Array();
            $(".create-poll-option").each(function(index){
                var option = $(this).val();
                if (option.trim() != "")
                    poll.options.push(option);
            });
           room.sendcmd("poll-create", poll);
        });
        $('#user_bio_hover').hover(function () {
            mouseOverBio = true;
        }, function () {
            $('#user_bio_hover').hide();
            mouseOverBio = false;
        });
        $("#lead").click(function()
        {
           room.sendcmd("lead", null);
        });
        $("#unlead").click(function()
        {
           room.sendcmd("unlead", null);
        });
		$("#mute-button").click(function(){
			if ($(this).hasClass("unmuted")){
				mute($(this).data('ip'));
				$("#mute-button").removeClass("unmuted");
				$("#mute-button").addClass("muted");			
			}
			else{
				unmute($(this).data('ip'));
				$("#mute-button").removeClass("muted");
				$("#mute-button").addClass("unmuted");		
			}
		});
        //(C) BibbyTube, (C) Faqqq
        //https://github.com/Bibbytube/Instasynch/blob/master/Chat%20Additions/Autoscroll%20Fix/autoscrollFix.js
        $('#chat-messages').on('scroll',function()
        {
            var scrollHeight = $(this)[0].scrollHeight,
                scrollTop = $(this).scrollTop(),
                height = $(this).height();

            //scrollHeight - scrollTop will be 290 when the scrollbar is at the bottom
            //height of the chat window is 280, not sure where the 10 is from
            if ((scrollHeight - scrollTop) < height*1.1){
                autoscroll = true;
            }else{
                autoscroll = false;
            }
        });
		$("#cin").on("keypress", function(e)
		{
			if (e.which == 13)
			{
				if ($('#cin').val().trim() != '') 
				{
					room.sendmsg(($('#cin').val()));
					$('#cin').val('');
				}
			}
		});
		$("#join-username").on("keypress", function(e)
		{
			if (e.which == 13)
			{
				join();
			}
		});	
		$("#autosynch").on("change", function()
		{
			toggleAutosynch();
		});
	
        //-----------------------
		showConnectionBox("Connecting..", function(){
			if (cleanUp == false) //to stop the double connect when leaving before the show connection box function finishes
		        room.connect();	
		});
		var cleanUp = false; 
		$("#cleanUpOnRemoval").on("remove", function() //disconnect when swapping page
		{
			global.sendcmd = null;
			video.destroy();
			video = null;
			room.disconnect();
			cleanUp = true;
		});
    });
     
    function webSocket() {
		var server = "";
		if (document.domain == "dev.instasynch.com"){
			server = "dev.instasynch.com";
		}
		else{
			server = "chat.instasynch.com";
		}
		var port = 38000;//Math.floor(Math.random() * 4 + 38000);
        var lastMsg = null;
        var socket = null;
		var delay = 0;
        socket = io.connect(server + ":" + port, 
        {
			query: "room="+ROOMNAME,
            reconnect: true,
            "force new connection": true,
            "try multiple transports": false,
            "reconnection delay": 1000,
            "max reconnection attempts": 5,
            "auto connect": false,
			"sync disconnect on unload": true,
			//transports: ['jsonp-polling'] //testing
        });
        this.sendmsg = function (message) {
            var d = new Date();
            message = message.substring(0, 240);
            if (d.getTime() > lastMsg + delay) 
            {
                if (message[0] == "'") 
                {
                    var arguments = message['split'](' ');
                    if (commands[arguments[0]['toLowerCase']()] != undefined) {
                        commands[arguments[0]['toLowerCase']()](arguments);
                    }
                }
                else
                {
                    socket.emit('message', {message: message}); 
                }
                lastMsg = d['getTime']();
            }
        };
        this.sendcmd = function (command, data) {
            socket.emit('command', {command: command, data: data});
        };
        this.rename = function (username) {
            socket.emit('rename', {username: username});
        };
        this.disconnect = function () {
            socket.disconnect();
        };
        this.connect = function () {
            socket.socket.connect();
        };
        socket.on('sys-message', function (data) {
            addMessage({username: ""}, data.message, 'system');
        });
        socket.on('rename', function (data) {
            renameUser(data.id, data.username);
            if (data['id'] == userInfo['id']) {
                userInfo['username'] = data['username'];
                join = null;
                $('#btn-join')['unbind']('click');
                $('#join-box')['remove']();
                $('#addVid')['css']('visibility', 'visible');
                $('#cin').switchClass('inactive', 'active');
                $('#cin')['removeAttr']('disabled');
                $('#cin')['focus']();
                $('#URLinput')['removeAttr']('disabled');               
            }
        });
        socket.on('connecting', function () {
			$("#connection-status").text("Connecting..");
			if (global.onConnecting != undefined)
			{
				global.onConnecting();
			}
        });
        socket.on('connect', function () {
            if ($['cookie']('username') === undefined || $['cookie']('sessionid') === undefined) 
            {
                socket.emit('join', { username: '', cookie: '', room: ROOMNAME});
            } 
            else 
            {
                socket.emit('join', {username: $['cookie']('username'),cookie: $['cookie']('sessionid'), room: ROOMNAME});
            }
			if (global.onConnected != undefined)
			{
				global.onConnected();
			}
			if (global.onJoining != undefined)
			{
				global.onJoining();
			}			
        });
        socket.on('reconnecting', function (data) {
			if (global.onReconnecting != undefined)
			{
				global.onReconnecting();
			}
        });
        socket.on('reconnect', function (data) {
			if (global.onReconnect != undefined){
				global.onReconnect();
			}
		});
		socket.on('reconnect_failed', function () {
			if (global.reconnectFailed != undefined)
			{
				global.reconnectFailed();
			}			
		});
		socket.on('request-disconnect', function()
		{
			socket.disconnect();
		});
        socket.on('disconnect', function (data){
			if (global.onDisconnect != undefined)
			{
				global.onDisconnect();
			}
        });
		socket.on('error', function(data){
			if (global.onError != undefined)
			{
				global.onError();
			}
		});
        socket.on('userinfo', function (data) {
            if (true)//if (userInfo == null) //edit this when ready to fix unnamed bug (github issue #4)
            {
                userInfo = data;
                if (data['loggedin']) 
                {
                    join = null;
                    $('#btn-join')['unbind']('click');
                    $('#join-box').remove();
                    $('#addVid')['css']('visibility', 'visible');
					$('#cin').switchClass('inactive', 'active');
                    $('#cin')['removeClass']('hide');
                    $('#cin')['removeAttr']('disabled');
                    $('#cin')['focus']();
                    $('#URLinput')['removeAttr']('disabled');
                }
                else 
                {
                    $('#join-box').show();
                    $('#addVid')['css']('visibility', 'hidden');
                    $('#cin')['show']();
                    $('#cin')['attr']('disabled', 'true');
                    $('#URLinput')['attr']('disabled', 'true');
                }
                if (data['permissions'] > 0) 
                {
                    $('.mod')['css']('visibility', 'visible');
                    //$( "#ulPlay" ).disableSelection(); I don't think this did anything               
                    isMod = true;
                }
            } 
            else //edit this when ready to fix unnamed bug (Github issue #4)
            {
                if (userInfo['loggedin'] == false && userInfo['username'] != 'unnamed') 
                {
                    //socket.emit('rename', {username: userInfo['username']});
                }
                userInfo = data;
            }
			if (global.onJoined != undefined)
			{
				global.onJoined();
			}
        });
        socket.on('playlist', function (data) {
            loadPlaylist(data.playlist);
        });
        socket.on('userlist', function (data) {
            loadUserlist(data.userlist);
        });
        socket.on('room-event', function (data) 
        {
            if (data.action === 'playlistlock') 
            {
                playlistlock(data['data']);
            }
            if (data.action === 'poll-create') 
            {
                createPoll(data.poll);
            }
            if (data.action === 'poll-end') 
            {
                endPoll();
            }
            if (data.action === 'poll-addVote') 
            {
                addPollVote(data.option);
            }
            if (data.action === 'poll-removeVote')
            {
                removePollVote(data.option);
            }
            if (data.action === 'leader')
            {
                makeLeader(data.userId);
                if (data.userId === userInfo.id)
                {
                    isLeader = true;
                    $(".leader").show();
                    $( "#video-list" ).sortable(
                    {
                        update : function (event, ui){
                                   room.sendcmd('move', {info: ui.item.data("info"), position: ui.item.index()});
                                    $( "#video-list" ).sortable( "cancel" );
                                 },
                         start: function(event,ui)
                         {
                             //Prevents click event from triggering when sorting videos
                             $("#video-list").addClass('noclick');
                         }
                        
                    });
                    $("#video-list").sortable( "enable" );
                    $("#lead").hide();
                    $("#unlead").show();
					/*
					 * Make sure to show YouTube control bar for leader
					 */
					if (video.video != null){
						video.video.controls(true);
					}
                }
                else
                {
                    if (isLeader)
                    {
                        isLeader = false;
                        $(".leader").css("display", "none");
                        $("#video-list").sortable("disable");
                        $("#unlead").hide();
                        if (isMod)
                        {
                            $("#lead").show();
                        }
                    }
					/*
					 * Disable video.js for youtube if the user has yt controls on
					 */
					if (video.video != null && video.loadedVideo.provider == "youtube"){
						video.video.controls(!showYTcontrols);
					}
                }
            }
        });
        socket.on('add-user', function (data) 
        {
            addUser(data['user'], true);
        });
        socket.on('remove-user', function (data) 
        {
            removeUser(data['userId']);
        });
        socket.on('chat', function (data) 
        {
            addMessage(data.user, data.message, '');
        });
        socket.on('add-vid', function (data) {
            addVideo(data.info, true);
        });
        socket.on('remove-vid', function (data) {
			for(var i = 0; i < data.videos.length; i++){
				removeVideo(data.videos[i]);
			}
			$("#videos").data("jsp").reinitialise(); //this uses alot of resources
        });
        socket.on('move-vid', function (data) {
            moveVideo(data.info, data.position);
        });
        socket.on('play', function (data) {
            playVideo(data.info, data.time, data.playing);
        });
        socket.on('resume', function (data) {
            resume();
        });
        socket.on('pause', function (data) {
            pause();
        });
        socket.on('seekTo', function (data) {
            seekTo(data.time);
        });
        socket.on('skips', function (data) {
            skips(data.skips, data.skipsneeded);
        });
        socket.on('purge', function (data) {
            purge(data.username);
        });
        socket.on('log', function (data) {
            console.log(data.message);
        });
    }
    var commands = {
        "'ban": function (data) {
            var banUserID = null;
            for (var i = 0; i < users['length']; i++) {
                if (users[i].username.toLowerCase() === data[1].toLowerCase()) {
                    banUserID = users[i].id;
                }
            }
           room.sendcmd('ban', {userid: banUserID});
        },
        "'unban": function (data) {
           room.sendcmd('unban', {username: data[1]});
        },
        "'clearbans": function (data) {
           room.sendcmd('clearbans', null);
        },
        "'kick": function (data) {
            var kickUserID = null;
            for (var i = 0; i < users['length']; i++) {
                if (users[i]['username']['toLowerCase']() === data[1]['toLowerCase']()) {
                    kickUserID = users[i]['id'];
                }
            }
           room.sendcmd('kick', {userid: kickUserID});
        },
        "'next": function (data) {
           room.sendcmd('next', null);
        },
        "'remove": function (data) {
            if (!isNaN(data[1])) {
               room.sendcmd('remove', {info: playlist[data[1]].info});
            }
        },
        "'purge": function (data) {
           room.sendcmd('purge', {username: data[1]});
        },
        "'play": function (data) {
            if (!isNaN(data[1])) {
               room.sendcmd('play', {
                    info: playlist[data[1]].info
                });            
            }
        },
        "'pause": function (data) {
           room.sendcmd('pause', null);
        },
        "'resume": function (data) {
           room.sendcmd('resume', null);
        },
        "'seekto": function (data) {
            if (!isNaN(data[1])) {
               room.sendcmd('seekto', {time: data[1]});
            }
        },
        "'seekfrom": function (data) {
            if (!isNaN(data[1])) {
               room.sendcmd('seekfrom', {time: data[1]});
            }
        },
        "'setskip": function (data) {
            if (!isNaN(data[1])) {
               room.sendcmd('setskip', {skip: data[1]});
            }
        },
        "'resynch": function (data) {
           room.sendcmd('resynch', null);
        },
        "'motd": function (data) {
            data.splice(0, 1);
           room.sendcmd('motd', {MOTD: data.join(' ')});
        },
        "'mod": function (data) {
           room.sendcmd('mod', {username: data[1]});
        },
        "'demod": function (data) {
           room.sendcmd('demod', {username: data[1]});
        },
        "'banlist": function (data) {
           room.sendcmd('banlist', null);
        },
        "'modlist": function (data) {
           room.sendcmd('modlist', null);
        },
        "'description": function (data) {
            data['splice'](0, 1);
           room.sendcmd('description', {description: data['join'](' ')});
        },
        "'move": function (data) {
            if (!isNaN(data[1]) && !isNaN(data[2])) {
               room.sendcmd('move', {info: playlist[data[1]].info,position: data[2]});
            }
        },
        "'clean": function (data) {
           room.sendcmd('clean', null);
        },
        "'togglefilter": function (data) {
            filterGreyname = !filterGreyname;
        },      
        "'save": function (data) {
           room.sendcmd("save", null);
        },     
        "'toggleautosynch": function (data) {
            toggleAutosynch();
        },
        "'leaverban": function (data) {
           room.sendcmd("leaverban", {username: data[1]});
        },        
        "'lead": function (data) {
           room.sendcmd("lead", null);
        },   
        "'unlead": function (data) {
           room.sendcmd("unlead", null);
        }           
    };	
}
});

/* ------------------------------
 *  [GLOBAL SCOPE] 
 *  Most of these get reset during a partial page reload
 *  Todo: Declare these elsewhere so they can get redeclared
 *  and reset on reload
 * ------------------------------
 */

//Moved all these down here so they can be exposed for userscripts
var users = new Array();
var playlist = new Array();
playlist.move = function (old_index, new_index) //Code is property of Reid from stackoverflow
{ 
	if (new_index >= this.length) {
		var k = new_index - this.length;
		while ((k--) + 1) {
			this.push(undefined);
		}
	}
	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
};
var totalTime = 0;
var messages = 0;
var MAXMESSAGES = 175;
var mouseOverBio = false;
var autoscroll = true;
var isMod = false;
var isLeader = false;
var mutedIps = new Array();
var userInfo = null;
var newMsg = false;
var filterGreyname = false;
var autosynch = true;
var showYTcontrols = false;
//var video = null;
//video = new player("media", global.sendcmd);
//detectIE();

function addMessage(user, message, extraStyles) { //extraStyles = additional classes FOR THE MESSAGE STYLE
	var usernameClass = "";
	if (filterGreyname === true)
	{
		if (user.loggedin === false) 
		{
			return;
		}
	}
	if (isMuted(user.ip))
	{
		return;
	}
	if (user.loggedin) {
		usernameClass += 'registered ';
	}
	else{
		usernameClass += 'unregistered';
	}
	var messageBox = $('<div/>', {
		"class": "message"
	});
	if (message.substring(0,4) == "/me "){ //emote text
		message = message['substring'](3);
		messageBox.append($("<span/>",{
			"class":"emote",
			"text":user.username + " " + message
		}));
	}
	else if(message.substring(0, 4) == '&gt;'){ //greentext
		messageBox.append($("<span/>", {
			"class":"username "+usernameClass,
			"text":user.username+": "
		}));
		messageBox.append($("<span/>",{
			"class":"text greentext",
			"html":message //convert to text when switching anti xss to client side
		}));
	}
	else if (message[0] == "#"){ //hashtext
		messageBox.append($("<span/>", {
			"class":"username "+usernameClass,
			"text":user.username+": "
		}));
		messageBox.append(($("<span/>",{
			"class":"text hashtext",
			"html":message //convert to text when switching anti xss to client side
		})));	
	}
	else if(message[0] == '/' && $codes[message.substring(1)] != undefined){ //emote
		var emote = message['substring'](1);
		messageBox.append($("<span/>", {
			"class":"username "+usernameClass,
			"text":user.username+": "
		}));
		messageBox.append($("<span/>",{
			"class":"",
			"html":$codes[emote]
		}));
	}
	else{ //regular message
		messageBox.append($("<span/>", {
			"class":"username "+usernameClass,
			"text":user.username+": "
		}));
		var msg = $("<span/>",{
			"class":"text "+extraStyles,
			"html":linkify(message)//switch this to text when switching to xss prevention client side
		});
		messageBox.append(msg);
	}
	$("#chat-messages").append(messageBox);	
	if (autoscroll === true) {
		var textarea = document.getElementById('chat-messages');
		textarea.scrollTop = textarea.scrollHeight;
	}
	if (!$('#cin')['is'](':focus')) {
		document.title = ' New message! :)';
		newMsg = true;
	}
	messages++;
	cleanChat();
}
function cleanChat() 
{
	//(C) Faqqq, (C) BibbyTube 
	//https://github.com/Bibbytube/Instasynch/blob/master/Chat%20Additions/Autoscroll%20Fix/autoscrollFix.js
	var max = MAXMESSAGES;
	//increasing the maximum messages by the factor 2 so messages won't get cleared
	//and won't pile up if the user goes afk with autoscroll off
	if(!autoscroll){
		max = max*2;
	}
	while(messages > max){
		$('#chat-messages > :first-child').remove(); //div messages
		messages--;
	}
}
function addUser(user, sort) {
	var css = '';
	if (user['loggedin']) {
		css += 'registered ';
	}
	if (user['permissions'] > 0) {
		css += 'm ';
	}
	css += isMuted(user.ip) ? "muted" : "";
	user.css = css;
	users.push(user);
	var userElement = $('<li/>', {
		"class": css,
		"text":user.username,
		"data": {username: String(user.username), id: user.id, css: css, loggedin: user.loggedin, ip: user.ip},
		"click": function () {
			$('#cin')['val']($('#cin')['val']() + $(this).data('username'));
			$('#cin')['focus']();
		}
	});
	userElement.hover(function () 
	{
		var thisElement = $(this);
		$(this).data('hover', setTimeout(function () 
		{
			$('#bio-username').text(thisElement.data('username').toUpperCase());
			$("#user_bio_hover").css('top', $(thisElement).offset().top - $("#chat").offset().top + 10);
			$('#bio-image').attr('src', '');
			$('#bio-text').text('');
			//reset
			$('#ban').data('id', "");
			$('#kick').data('id', "");
			$('#mute-button').data('ip', "");	
			//
			$('#user_bio_hover').show();
			if (thisElement.data('loggedin') == true) 
			{
				getUserInfo(thisElement.data('username'), function (avatar, bio) {
					$('#bio-image').attr('src', avatar);
					$('#bio-text').text(bio);
				});
			} else {
				$('#bio-text').html("<span style='color: grey; font-style:italic'>User is not registered.</span>");
			}
			$('#ban').data('id', user['id']);
			$('#kick').data('id', user['id']);
			$('#mute-button').data('ip', user.ip);
			//show or hide mute/unmute buttons
			if (isMuted(user.ip))
			{
				$("#mute-button").removeClass("");
				$("#mute-button").addClass("");
			}
			else
			{
				$("#mute-button").removeClass("");
				$("#mute-button").addClass("");              
			}
		}, 600));
	}, function () {
		clearTimeout($(this).data('hover'));
		setTimeout(function () {
			if (!mouseOverBio) {
				$('#user_bio_hover').hide();
			}
		}, 50);
	});
	$('#userlist').append(userElement);
	$('#viewercount').text(users.length);
	if (sort === true) {
		sortUserlist();
	}
}
function removeUser(id) {
	for (var i = 0; i < users.length; i++) 
	{
		if (id === users[i].id) 
		{
			users['splice'](i, 1);
			$($('#userlist').children('li')[i]).remove();
			break;
		}
	}
	$('#viewercount').html(users.length);
}
function makeLeader(userId)
{
	$("#leaderSymbol").remove();
	for (var i = 0; i < users.length; i++) 
	{
		if (users[i].id == userId) 
		{
			var leaderElement = $("<img />", {
				"id":"leaderSymbol",
				"src":"/images/leader.png",
				"height":"16px",
				"width":"16px"
			});
			$($("#userlist li")[i]).prepend(leaderElement);
			break;
		}
	}    
}
function renameUser(id, username) {
	for (var i = 0; i < users.length; i++) 
	{
		if (users[i].id == id) 
		{
			users[i].username = username;
			$($('#userlist li')[i]).html(username);
			$($('#userlist li')[i]).data('username', username);
			break;
		}
	}
	sortUserlist();
}
function sortUserlist() {
	var userlist = $('#userlist li')['clone'](true);
	userlist.sort(function (a, b) {
		var keyA = $(a).data('username').toLowerCase();
		var keyB = $(b).data('username').toLowerCase();
		if (keyA < keyB) {
			return -1;
		}
		if (keyA > keyB) {
			return 1;
		}
		return 0;
	});
	userlist.sort(function (a, b) {
		var keyA = $(a).data('css');
		var keyB = $(b).data('css');
		if (keyA > keyB) {
			return -1;
		}
		if (keyA < keyB) {
			return 1;
		}
		return 0;
	});
	$('#userlist').empty();
	$('#userlist').html(userlist);
	users.sort(function (a, b) {
		var keyA = a.username.toLowerCase();
		var keyB = b.username.toLowerCase();
		if (keyA < keyB) {
			return -1;
		}
		if (keyA > keyB) {
			return 1;
		}
		return 0;
	});
	users.sort(function (a, b) {
		var keyA = a.css;
		var keyB = b.css;
		if (keyA > keyB) {
			return -1;
		}
		if (keyA < keyB) {
			return 1;
		}
		return 0;
	});
}
function addVideo(vidinfo, updateScrollbar) {
	playlist.push({info: vidinfo.info, title: vidinfo.title, addedby: vidinfo.addedby, duration: vidinfo.duration});
	var li = $('<li/>', {"class":"video","data":{info: vidinfo.info}});
		var vidInfo = $('<div/>', {"class":"video-info"})
			.append($('<div/>',{"class":"title","text":vidinfo.title, "title":vidinfo.title}))
			.append($('<div/>',{"class":"via", "text":"via " + vidinfo.addedby}))
			.append($('<div/>',{"class":"duration","text":secondsToTime(vidinfo.duration)}));
		var buttons = $('<div/>',{"class":"buttons"})
			.append($('<div/>',{
					"class":"info",
					"title":"More information about this video.",
					"click":function()
					{
						$(".detailed-info").fadeIn(); //to show loading spinner
						getVideoInfo(vidinfo.info, function(err, data){
							if (err){
								//output error
							}
							else{
								showVideoInfo(vidinfo.info, data);
							}
						});
					}
				}))
			.append($('<a/>',{
					"class":"link",
					"title":"Open this video in a new tab.",
					"href":url(vidinfo),
					"target":"_blank",
					"style":"display: inline-block"
				}));
			if (isMod) //if mod, 
			{
				buttons.append($('<div/>',
				{
					"class":"remove",
					"title":"Remove video",
					"click":function()
					{
						global.sendcmd('remove', {info: vidinfo.info});
					}
				}));
			}
	$(vidInfo).click(function()
	{
		if ($("#video-list").hasClass("noclick")) //Don't make the video play if sorting video
		{
			$("#video-list").removeClass('noclick');
		}
		else
		{
			if (isLeader)
			{
				global.sendcmd('play', {info: vidinfo.info});
			}
			else
			{
				$('#cin').val($('#cin').val() + getVideoIndex(vidinfo.info) + ' ');
				$('#cin').focus();
			}
		}
	});
	li.append(vidInfo).append(buttons);	
	$('#video-list').append(li);
	totalTime += vidinfo.duration;
	$('#total-videos').html(playlist.length);
	$('#total-duration').html(secondsToTime(totalTime));
	if (updateScrollbar)
		$("#videos").data("jsp").reinitialise(); //uses alot of resources
}
function showVideoInfo(video, data){
	if (video.provider == "youtube"){
		var title = $("#youtube-title");
		title.text(data.entry.title.$t);
		title.attr("title", title.text());
		var youtubeName = data.entry.author[0].name.$t;
		var youtubeUser = data.entry.media$group.media$credit[0].$t;
		$("#youtube-uploader").html($("<a/>",{
			"text":youtubeName,
			"title":"https://www.youtube.com/user/" + youtubeUser,
			"href":"https://www.youtube.com/user/" + youtubeUser,
			"target":"_blank"
		}));
		$("#youtube-views").text(commaSeparateNumber(data.entry.yt$statistics.viewCount));
		$("#youtube-likes").text(commaSeparateNumber(data.entry.yt$rating.numLikes));
		$("#youtube-dislikes").text(commaSeparateNumber(data.entry.yt$rating.numDislikes));
		var description = $("#youtube-description");
		var descriptionText = data.entry.media$group.media$description.$t;
		if (descriptionText == ""){
			description.html("<em>No description available.</em>");
		}
		else{			
			description.text(descriptionText);
			description.html(linkify(description.html().replace(/\n/g, '<br />'))); //transfer line breaks from description			
		}
		$(".detailed-info .loading").hide();
		$(".detailed-info .provider.youtube").show();
	}
	else if (video.provider == "vimeo"){
		data = data[0];//vimeo single video data is a one element array
		var title = $("#youtube-title");
		title.text(data.title);
		title.attr("title", title.text());
		$("#youtube-uploader").html($("<a/>",{
			"text":data.user_name,
			"title":data.user_url,
			"href":data.user_url,
			"target":"_blank"
		}));
		$("#youtube-views").text(commaSeparateNumber(data.stats_number_of_plays));
		$("#youtube-likes").text(commaSeparateNumber(data.stats_number_of_likes));
		$("#youtube-dislikes").text("n/a");
		var description = $("#youtube-description");
		var descriptionText = data.description;
		if (descriptionText == ""){
			description.html("<em>No description available.</em>");
		}
		else{
			description.text(descriptionText.replace(/<br \/>/g, ''));
			description.html(description.html().replace(/\n/g, '<br />')); //transfer line breaks from description			
		}
		$(".detailed-info .loading").hide();
		$(".detailed-info .provider.youtube").show();		
	}
} 
function removeVideo(vidinfo) {
	var indexOfVid = getVideoIndex(vidinfo);
	if (indexOfVid > -1 && indexOfVid < playlist.length) {
		totalTime -= playlist[indexOfVid].duration;
		playlist.splice(indexOfVid, 1);
		$($('#video-list').children('li')[indexOfVid]).remove();
	}
	$('#total-videos').html(playlist.length);
	$('#total-duration').html(secondsToTime(totalTime));
}
/*
 * TODO: Improve this as it emptys the list and rebuilds it everytime
 */
function moveVideo(vidinfo, position) {
	var indexOfVid = getVideoIndex(vidinfo);
	if (indexOfVid > -1) {
		playlist.move(indexOfVid, position);
		var playlistElements = $('#video-list li').clone(true);
		playlistElements.move = function (old_index, new_index) {
			if (new_index >= this.length) {
				var k = new_index - this.length;
				while ((k--) + 1) {
					this.push(undefined);
				}
			}
			this.splice(new_index, 0, this.splice(old_index, 1)[0]);
		};
		playlistElements.move(indexOfVid, position);
		$('#video-list').empty();
		$('#video-list').html(playlistElements);
	}
}
function getVideoIndex(vidinfo) {
	for (var i = 0; i < playlist.length; i++) {
		if (JSON['stringify'](playlist[i]['info']) === JSON['stringify'](vidinfo)) {
			return i;
		}
	}
	return -1;
}
function url(vidinfo)
{
		if (vidinfo.info.provider === 'youtube') {
			return 'http://www.youtube.com/watch?v=' + vidinfo.info.id;
		} 
		else if (vidinfo.info.provider === 'vimeo') {
			return'http://vimeo.com/' + vidinfo.info.id;
		}
		else if (vidinfo.info.provider === 'twitch') {
			if (vidinfo.info.mediaType === "stream")
				return 'http://twitch.tv/' + vidinfo.info.channel;
		}
		else if (vidinfo.info.provider === 'dailymotion'){
			return "http://dailymotion.com/video/"+vidinfo.info.id;
		}
		else{
			return "http://instasynch.com";
		}
}
function playlistlock(value) {
	if (value == true) {
		$('#toggleplaylistlock').css('background-image', 'url("/images/lock.png")');
	} else {
		$('#toggleplaylistlock').css('background-image', 'url("/images/unlock.png")');
	}
}
function toggleAutosynch()
{
	autosynch = !autosynch;
	if (autosynch)
	{
		global.sendcmd('resynch', null);
	}
}
function playVideo(vidinfo, time, playing) {
	var addedby = '';
	var title = '';
	var indexOfVid = getVideoIndex(vidinfo);
	if (indexOfVid > -1) 
	{
		title = playlist[indexOfVid].title;
		addedby = playlist[indexOfVid].addedby;
		$('.active').removeClass('active');
		$($('#video-list').children('li')[indexOfVid]).addClass('active');
		$('#vidTitle').html(title + '<div class=\'via\'> via ' + addedby + '</div>');
		video.play(vidinfo, time, playing);   
	}
}
function resume() {
		video.resume();
}
function pause() {
		video.pause();
}
function seekTo(time){
		video.seekTo(time);
}
function purge(username) {
	for (var i = playlist.length - 1; i >= 0; i--) 
	{
		if (playlist[i].addedby.toLowerCase() == username.toLowerCase()) {
			removeVideo(playlist[i].info, false);
		}
	}
	$("#videos").data("jsp").reinitialise();
}
//Clean all videos above this video
function clean(video){
	
}
function skips(skips, skipsNeeded) {
	$('#skip-count').html(skips + '/' + skipsNeeded);
}
function loadPlaylist(data) {
	playlist.length = 0;
	playlist = new Array();
	playlist.move = function (old_index, new_index) //Code is property of Reid from stackoverflow
	{ 
		if (new_index >= this.length) {
			var k = new_index - this.length;
			while ((k--) + 1) {
				this.push(undefined);
			}
		}
		this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	};	
	totalTime = 0;
	$('#video-list').html('');
	if (data != undefined && data.length != 0) {
		for (var i = 0; i < data.length; i++) {
			addVideo(data[i], false);
		}
	}
	$("#videos").data("jsp").reinitialise();	
}
function loadUserlist(userlist) {
	$('#userlist').empty();
	users = new Array();
	for (var i = 0; i < userlist.length; i++) {
		addUser(userlist[i], false);
	}
	sortUserlist();
}
function secondsToTime(num) 
{
	var hours   = Math.floor(num / 3600);
	var minutes = Math.floor((num - (hours * 3600)) / 60);
	var seconds = num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	var time = "";
	if (hours != 0){ time+= hours + ':' }
	time += minutes+':'+seconds;
	return time;
}
/*
 * Timothy Perez
 * http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery#answer-12947816
 */
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }
function createPoll(poll) //poll.title, poll.options = array of {option, votes}
{    
	$(".st-poll").css('display', '');    
	$(".poll-title").html(poll.title);
	var choices = $(".poll-results.choices");  
	$(choices).empty();
	for(var i = 0; i < poll.options.length; i++)
	{
		var choice = 
		$("<div/>",
		{
			"class":"poll-item choice"
		}).append($("<span/>",
		{
			"class":"poll-vote-btn basic-btn vote_choice",
			"html":poll.options[i].votes,
			"data":{option: i},
			"click": function(){ 
				if (userInfo.loggedin)
				{
					global.sendcmd("poll-vote", {vote: $(this).data("option")});
				}
				else
				{
					addMessage({username: ""},"You must be logged in to vote on polls.","errortext");
				}
			}
		})).append($("<span/>",
		{
			"class":"poll-vote-text",
			"html":linkify(poll.options[i].option, false, true)
		}));
		$(choices).append(choice);
	}
}
function addPollVote(vote)
{
	var element = $(".vote_choice")[vote];
	$(element).html(parseInt($(element).html(), 10) + 1);
}
function removePollVote(vote)
{
	var element = $(".vote_choice")[vote];
	$(element).html(parseInt($(element).html(), 10) - 1);    
}
function endPoll()
{
	$(".st-poll").css('display', 'none');    
}
function showConnectionBox(message, callback){
	$("#connection-status").text(message);
	var box = $("#connection-status-box");
	if (box.css('display') == 'none'){
		box.fadeIn(600, function(){
			if (callback != undefined)
				callback();
		});
	}
}
function hideConnectionBox(callback){
	var box = $("#connection-status-box");
	if ($("#connection-status-box").css('display') != 'none'){
		box.fadeOut(1200, function(){
			if (callback != undefined)
				callback();
		});
	}
}
function mute(ip)
{
	mutedIps[ip] = ip;
	for (var i = 0; i < users.length; i++)
	{
		if (users[i].ip == ip)
		{
			$($("#userlist li")[i]).addClass("muted");
		}
	}
}
function unmute(ip)
{
	mutedIps[ip] = undefined;
	for (var i = 0; i < users.length; i++)
	{
		if (users[i].ip == ip)
		{
			$($("#userlist li")[i]).removeClass("muted");
		}
	}
}
function isMuted(ip)
{
	if (mutedIps[ip] != undefined)
	{
		return true;
	}
	else
	{
		return false;
	}
}
function detectIE()
{
	var ie = (function(){

		var undef,
			v = 3,
			div = document.createElement('div'),
			all = div.getElementsByTagName('i');

		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
			all[0]
		);

		return v > 4 ? v : undef;

	}());
	if (ie < 10)
	{
		addMessage({username: ""},"Internet Explorer versions 9 and and older are not supported. Please upgrade to I.E. 10 or later.","errortext");
	}
}
