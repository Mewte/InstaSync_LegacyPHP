/*
    <InstaSynch - Watch Videos with friends.>
    Copyright (C) 2013  InstaSynch
*/
var global = new Object();
global.requestPartialPage = null;
global.loadRoomObj = null;
global.page = new Object();
global.page = {title: null, url: null, name: null, room: null};
global.sendcmd = null;

var video = null;

$(function (){
window.onpopstate = function(event) {
	global.requestPartialPage(event.state.name, event.state.room, true);
};
$(document).ready(function()
{
	//mark this current page load in the history state (so we can come back to it if the user presses back)
	//use replaceState so that the state is saved into the history.state object, but doesn't push the entry into history
	if (history.state == undefined)
	{
		history.replaceState(global.page, global.page.title, global.page.url);
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
	video = new player("media", global.sendcmd);
	messages = 0;
	detectIE();

    var join = function () 
    {
        if (validateJoin($('#join').val())) 
        {
            room.rename($('#join').val());
        } 
        else 
        {
            $('#join').val('');
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
        $('#btn-join').click(function () {
            join();
        });
        $('#skip').click(function () {
            if (userInfo.loggedin)
                room.sendcmd('skip', null);
            else
                addMessage("","You must be logged in to vote to skip.","","errortext");
        });
        $('#resynch').click(function () {
            room.sendcmd('resynch', null);
        });
        $('#reload').click(function () {
            video.destroyPlayer();
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
        $('#bio').hover(function () {
            mouseOverBio = true;
        }, function () {
            $('#bio').hide();
            mouseOverBio = false;
        });
        //Player Controller
        $( "#slider" ).slider(
        {
            "slide":function(event, ui)
            {
                $("#sliderCurrentTime").html(secondsToTime(ui.value));
                
            },
            "start": function(event, ui)
            {
                $("#slider").data("sliding", true);
            },
            "stop":function(event, ui)
            {
                //sendcmd("seekTo", ui.valie)
               room.sendcmd("seekto", {time: ui.value});
                $(this).data("sliding", false);
            }
        });
        $("#slider").data("sliding", false); //do not update timer while sliding
        $("#play").click(function()
        {
           room.sendcmd("resume", null);
        });
        $("#pause").click(function()
        {
           room.sendcmd("pause", null);
        });
        $("#lead").click(function()
        {
           room.sendcmd("lead", null);
        })
        $("#unlead").click(function()
        {
           room.sendcmd("unlead", null);
        })
        $('#mute').click(function()
        {
            mute($(this).data('ip'));
            $("#mute").hide();
            $("#unmute").show();
        });
        $("#unmute").click(function()
        {
            unmute($(this).data('ip'));
            $("#mute").show();
            $("#unmute").hide();
        });
        //(C) BibbyTube, (C) Faqqq
        //https://github.com/Bibbytube/Instasynch/blob/master/Chat%20Additions/Autoscroll%20Fix/autoscrollFix.js
        $('#chat_list').on('scroll',function()
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
		$("#join").on("keypress", function(e)
		{
			if (e.which == 13)
			{
				join();
			}
		});		
        //-----------------------
        room.connect();
		$("#cleanUpOnRemoval").on("remove", function() //disconnect when swapping page
		{
			global.sendcmd = null;
			video = null;
			room.disconnect();
		});
    });
    
    var filterGreyname = false; 
    function webSocket() {
        var server = window.location.hostname;
		var port = Math.floor(Math.random() * 4 + 38000);
        var lastMsg = null;
        var socket = null;
		var delay = 0;
        socket = io.connect(server + ":" + port, 
        {
            reconnect: true,
            "force new connection": false,
            "try multiple transports": false,
            "reconnection delay": 1000,
            "max reconnection attempts": 5,
            "auto connect": false,
			"sync disconnect on unload": true
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
            addMessage('', data.message, '', 'hashtext');
        });
        socket.on('rename', function (data) {
            renameUser(data.id, data.username);
            if (data['id'] == userInfo['id']) {
                userInfo['username'] = data['username'];
                join = null;
                $('#btn-join')['unbind']('click');
                $('#join-chat')['remove']();
                $('#addVid')['css']('visibility', 'visible');
                $('#cin')['removeClass']('hide');
                $('#cin')['removeAttr']('disabled');
                $('#cin')['focus']();
                $('#URLinput')['removeAttr']('disabled');               
            }
        });
        socket.on('connecting', function () {
            addMessage('', 'Connecting..', '', 'hashtext');
			if (global.onConnecting != undefined)
			{
				global.onConnecting();
			}
        });
        socket.on('connect', function () {
            addMessage('', 'Connection Successful!', '', 'hashtext');
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
        });
        socket.on('reconnecting', function (data) {
            addMessage('', 'Reconnecting...', 'system-msg');
			if (global.onReconnecting != undefined)
			{
				global.onReconnecting();
			}
        });
        socket.on('reconnected', function (data) {});
		//var reconnect = true;
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
        socket.on('userinfo', function (data) {
            if (true)//if (userInfo == null) //edit this when ready to fix unnamed bug (github issue #4)
            {
                userInfo = data;
                if (data['loggedin']) 
                {
                    join = null;
                    $('#btn-join')['unbind']('click');
                    $('#join-chat')['remove']();
                    $('#addVid')['css']('visibility', 'visible');
                    $('#cin')['removeClass']('hide');
                    $('#cin')['removeAttr']('disabled');
                    $('#cin')['focus']();
                    $('#URLinput')['removeAttr']('disabled');
                }
                else 
                {
                    $('#join-chat')['show']();
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
                    $( "#ulPlay" ).sortable(
                    {
                        update : function (event, ui){
                                   room.sendcmd('move', {info: ui.item.data("info"), position: ui.item.index()});
                                    $( "#ulPlay" ).sortable( "cancel" );
                                 },
                         start: function(event,ui)
                         {
                             //Prevents click event from triggering when sorting videos
                             $("#ulPlay").addClass('noclick');
                         }
                        
                    });
                    $("#ulPlay").sortable( "enable" );
                    sliderTimer = setInterval(function()
                    {
                       video.time(function(time)
                       {
                           if ($("#slider").data("sliding") === false)
                           {
                               time = Math.round(time);
                               $( "#slider" ).slider("option", "value", time);
                               $("#sliderCurrentTime").html(secondsToTime(time));
                           }
                       });
                    }, 1000);
                    
                    $("#lead").hide();
                    $("#unlead").show();
                }
                else
                {
                    if (isLeader)
                    {
                        isLeader = false;
                        if (sliderTimer != false)
                        {
                            clearTimeout(sliderTimer);
                            sliderTimer = false;
                        }
                        $(".leader").css("display", "none");
                        $("#ulPlay").sortable("disable");
                        $("#unlead").hide();
                        if (isMod)
                        {
                            $("#lead").show();
                        }
                    }
                }
            }
        });
        socket.on('add-user', function (data) 
        {
            var user = data['user'];
            var room7 = '';
            if (user['loggedin']) {
                room7 += 'b ';
                if (user['permissions'] > 0) {
                    room7 += 'm ';
                }
            }
            addUser(data['user'], room7, true);
        });
        socket.on('remove-user', function (data) 
        {
            removeUser(data['userId']);
        });
        socket.on('chat', function (data) 
        {
            var user = data['user'];
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
            var userstyle = '';
            if (user.loggedin) {
                userstyle += 'r ';
            }
            addMessage(user.username, data.message, userstyle, '');
        });
        socket.on('add-vid', function (data) {
            addVideo(data.info);
        });
        socket.on('remove-vid', function (data) {
            removeVideo(data.info);
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
var sliderTimer = false;
var mutedIps = new Array();
var userInfo = null;
var newMsg = false;
//var video = null;
//video = new player("media", global.sendcmd);
//detectIE();

function addMessage(username, message, userstyle, textstyle) {
	message = linkify(message, false, true);
	$('<span/>', {
		"class": 'cun c1m ' + userstyle,
		"id": '',
		"css": {
			"padding-left": '10px'
		},
		"html": username + ':'
	}).appendTo('#chat_list');
	if (message[0] == '/' && $codes[message.substring(1)] != undefined) 
	{
		var emote = message['substring'](1);
		$('<span/>', {
			"class": 'cm',
			"html": $codes[emote]
		}).appendTo('#chat_list');
	} 
	else 
	{
		if (message['substring'](0, 4) == '&gt;') {
			textstyle = 'greentext';
		}
		if (message[0] == '#') {
			textstyle = 'hashtext';
		}
		$('<span/>', {
			"class": 'cm ' + textstyle,
			"id": '',
			"css": {},
			"html": message
		}).appendTo('#chat_list');
	}
	$('#chat_list').append($('<br/>'));
	if (autoscroll === true) {
		var textarea = document.getElementById('chat_list');
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
		$('#chat_list > :first-child').remove(); //span user
		$('#chat_list > :first-child').remove(); //span message
		$('#chat_list > :first-child').remove(); //<br>
		messages--;
	}
}
function addUser(user, css, sort) {
	user.css = css;
	var muted = isMuted(user.ip) ? "muted" : "";
	users.push(user);
	var userElement = $('<div/>', {
		"class": "user_list " + muted,
		"data": {username: String(user.username), id: user.id, css: css
		},
		"click": function () {
			$('#cin')['val']($('#cin')['val']() + $(this).data('username'));
			$('#cin')['focus']();
		},
		"css": {
			"cursor": 'default'
		}
	}).append($('<div/>', {"class": css})
	.append($('<span/>', {"html": user.username})));
	userElement.hover(function () 
	{
		var thisElement = $(this);
		$(this).data('hover', setTimeout(function () 
		{
			$('#bio .username span').html(thisElement.data('username'));
														  //$("#chat").offset().top is the offten from the top of the page, Use turnary operation: If bio goes above chat, minus some pixels
			$('#bio').css('top', ((thisElement.offset().top - $("#chat").offset().top - 15) < -10 ? -10 : thisElement.offset().top - $("#chat").offset().top - 15)); //cant be less than -10 pixels
			$('#bio .avatar img').attr('src', '');
			$('#bio .userinfo').html('');
			$('#bio').show();
			if (thisElement.data('css').indexOf('b') != -1) 
			{
				getUserInfo(thisElement.data('username'), function (avatar, bio) {
					$('#bio .avatar img').attr('src', avatar);
					$('#bio .userinfo').html(bio);
				});
			} else {
				$('#bio .userinfo').html('<span style=\'color: grey;\'>Unregistered</span>');
			}
			$('#ban').data('id', user['id']);
			$('#kick').data('id', user['id']);
			$('#mute').data('ip', user.ip);
			$('#unmute').data('ip', user.ip)
			//show or hide mute/unmute buttons
			if (isMuted(user.ip))
			{
				$("#unmute").show();
				$("#mute").hide();
			}
			else
			{
				$("#mute").show();
				$("#unmute").hide();                
			}
		}, 600));
	}, function () {
		clearTimeout($(this).data('hover'));
		setTimeout(function () {
			if (!mouseOverBio) {
				$('#bio').hide();
			}
		}, 50);
	});
	$('#chat_users').append(userElement);
	$('#viewercount').html(users.length);
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
			$($('#chat_users').children('div')[i]).remove();
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
			$($("#chat_users .user_list div")[i]).prepend(leaderElement);
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
			$($('#chat_users div span')[i]).html(username);
			$($('#chat_users .user_list')[i]).data('username', username);
			break;
		}
	}
	sortUserlist();
}
function sortUserlist() {
	var userlist = $('#chat_users .user_list')['clone'](true);
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
	$('#chat_users').empty();
	$('#chat_users').html(userlist);
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
function addVideo(vidinfo) {
	playlist.push({info: vidinfo.info, title: vidinfo.title, addedby: vidinfo.addedby, duration: vidinfo.duration});
	if (vidinfo.title.length > 55) 
	{
		vidinfo.title = vidinfo.title.substring(0, 55);
		vidinfo.title += '...';
	}
	var li = $('<li/>', {"data": {info: vidinfo.info}});
	var plinfo = $('<div/>', {"class": 'pl-info'});
		var plinfo_title = $('<div/>', 
		{
			"class": 'play title',
			"title": vidinfo.title,
			"html": vidinfo.title,
			"data": {
				info: vidinfo.info
			},
			"click": function () 
			{
				if ($("#ulPlay").hasClass("noclick"))
				{
					$("#ulPlay").removeClass('noclick');
				}
				else
				{
					if (isLeader)
					{
						global.sendcmd('play', {info: $(this).data("info")});
					}
					else
					{
						$('#cin').val($('#cin').val() + getVideoIndex($(this).parent().parent().data('info')) + ' ');
						$('#cin').focus();
					}
				}
			}
		}).append($('<span/>', {
			"class": 'via',
			"html": ' via ' + vidinfo.addedby
		}));
		var plinfo_duration = $('<div/>', {
			"class": 'duration',
			"html": secondsToTime(vidinfo.duration)
		});
		var vidlink = '';
		if (vidinfo.info.provider === 'youtube') {
			vidlink = 'http://www.youtube.com/watch?v=' + vidinfo.info.id;
		} 
		else if (vidinfo.info.provider === 'vimeo') {
			vidlink = 'http://vimeo.com/' + vidinfo.info.id;
		}
		else if (vidinfo.info.provider === 'twitch') {
			if (vidinfo.info.mediaType === "stream")
				vidlink = 'http://twitch.tv/' + vidinfo.info.channel;
		}        
		var expand = $('<div/>', {
			"class": 'expand'
		}).append($('<a/>', {
			"href": vidlink,
			"target": '_blank'
		}).append($('<img/>', {
			"src": '/images/expand.png'
		})));
		var removeBtn = $('<div/>', {
			"class": 'removeBtn x',
			"html": '',
			"click": function () {
				global.sendcmd('remove', {info: $(this).parent().parent().data('info')});
			}
		});
	$('#ulPlay').append(li.append(plinfo.append(plinfo_title).append(plinfo_duration).append(expand).append(removeBtn)));
	totalTime += vidinfo.duration;
	$('.total-videos').html(playlist.length + ' videos');
	$('.total-duration').html(secondsToTime(totalTime));
}
function removeVideo(vidinfo) {
	var indexOfVid = getVideoIndex(vidinfo);
	if (indexOfVid > -1 && indexOfVid < playlist.length) {
		totalTime -= playlist[indexOfVid].duration;
		playlist.splice(indexOfVid, 1);
		$($('#ulPlay').children('li')[indexOfVid]).remove();
	}
	$('.total-videos').html(playlist.length + ' videos');
	$('.total-duration').html(secondsToTime(totalTime));
}
function moveVideo(vidinfo, position) {
	var indexOfVid = getVideoIndex(vidinfo);
	if (indexOfVid > -1) {
		playlist.move(indexOfVid, position);
		var playlistElements = $('#ulPlay li').clone(true);
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
		$('#ulPlay').empty();
		$('#ulPlay').html(playlistElements);
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
function playlistlock(value) {
	if (value == true) {
		$('#toggleplaylistlock img')['attr']('src', '/images/lock.png');
	} else {
		$('#toggleplaylistlock img')['attr']('src', '/images/unlock.png');
	}
}
function toggleAutosynch()
{
	video.autosynch = !video.autosynch;
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
		$($('#ulPlay').children('li')[indexOfVid]).addClass('active');
		$('#vidTitle').html(title + '<div class=\'via\'> via ' + addedby + '</div>');
		video.play(vidinfo, time, playing);   
		$( "#slider" ).slider("option", "max", playlist[indexOfVid].duration);
		$("#sliderDuration").html("/" + secondsToTime(playlist[indexOfVid].duration))
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
			removeVideo(playlist[i].info);
		}
	}
}
function skips(skips, skipsNeeded) {
	$('#skipCounter').html(skips + '/' + skipsNeeded);
}
function loadPlaylist(data) {
	playlist.length = 0;
	totalTime = 0;
	$('#ulPlay').html('');
	if (data != undefined && data.length != 0) {
		for (var i = 0; i < data.length; i++) {
			addVideo(data[i]);
		}
	}
}
function loadUserlist(userlist) {
	users = new Array();
	$('#chat_users').html('');
	for (var i = 0; i < userlist.length; i++) {
		var user = userlist[i];
		var css = '';
		if (user['loggedin']) {
			css += 'b ';
			if (user['permissions'] > 0) {
				css += 'm ';
			}
		}
		addUser(user, css, false);

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
					addMessage("","You must be logged in to vote on polls.","","errortext");
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
function mute(ip)
{
	mutedIps[ip] = ip;
	for (var i = 0; i < users.length; i++)
	{
		if (users[i].ip == ip)
		{
			$($(".user_list")[i]).addClass("muted");
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
			$($(".user_list")[i]).removeClass("muted");
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
		addMessage("","Internet Explorer versions 9 and and older are not supported. Please upgrade to I.E. 10 or later.","","errortext");
		window.onerror = function() {
			return true;
		};
		/* some i.e. compatability stuff to mess with when ready for that update
			I.E. <10 doesn't support console.log (Don't know why I bother)
			if( window.console != undefined) {
				window.console = {log: function()
					{
						//do nothing
					}
				};
			}
			window.onerror = function(){
			   return true;
			};
			//---------------------------------
		 */
	}
}