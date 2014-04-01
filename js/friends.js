/*
    <InstaSynch - Watch Videos with friends.>
    Copyright (C) 2013  InstaSynch
*/
global.loadFriendService = null;
testRemove = null;
(function(){
global.loadFriendService = loadService; //loadFriendService is a one time triggered function
function loadService()
{
loadFriendService = null;

var friendsListSocket = null;
var thisFriendsListUI = null;
$(document).ready(function(){
    friendsListSocket = new friendsList();
    friendsListSocket.connect();
    thisFriendsListUI = new friendsListUI($(".friendsList"), friendsListSocket);
    setClickEvents();
	$(".friendsList").show();
	$(".friendsList .friendsList-list .category-list").perfectScrollbar();
	$(".friendsList .friendsList-list .category-list").bind('DOMNodeInserted DOMNodeRemoved', function(event) { //update perfect scrollbar
		$(this).perfectScrollbar('update');
    });
});
function setClickEvents(){
    $(".friendsList-expand").click(function(e)
    {
        $(this).parent().children('.friendsList-list').slideToggle();
    });
    $(".friendsList-list .category").click("toggle", function(e)
    {        
        var categoryImageObject = $(this).children(".category-expand");
        $(this).parent().children(".category-list").slideToggle({"complete": function()
            {
                //determine which image to show (+) or (-)
                var categoryImage = $(this).parent().children('.category-list').css("display") === "none" ? "plus" : "minus";
                categoryImageObject.attr("src", "/images/social/" + categoryImage + ".png");
				$(this).perfectScrollbar('update');
            }});
    });
	$("#add-friend").click(function()
	{
		var username = prompt("Send Friend Request","Username");
		if (username != null)
		{
			friendsListSocket.sendCmd("add-friend", {username : username});
		}
	});
}
$(document).scroll(function(e) {
    $('.friendsList').css({'top': $(document).scrollTop() + 10});
});
function contextMenu(element){
    var domElement = element;
    this.create = function(options)
    {
        $(domElement).empty();
        //options: {Menu Item, function to do on click}
        var menuItems = $("<ul/>",{});
        for (var i = 0; i < options.length; i++)
        {
            $(menuItems).append($("<li/>", {
                "html": options[i].item,
                "click": options[i].action
            }));
        }
        $(domElement).append(menuItems);
        $(domElement).mouseleave(function(){$(this).hide();});
    };
    this.show = function(x, y)
    {
        $(domElement).fadeIn();
        $(domElement).css("left", x - ($(domElement).width() / 2));
        $(domElement).css("top",y - ($(domElement).height() / 2));
    };
    this.hide = function()
    {
        $(domElement).hide();
    };
    $(domElement).click(function()
    {
        $(this).fadeOut();
    });
}
function friendsListUI(domElement, friendsListSocket)
{
    var ui = domElement;
    var clickMenu = new contextMenu($(".context-menu"));
    var thisUI = this; //for callback functions
	testRemove = this;
    this.addFriend = function(id, username, status){
        var friend = $("<li/>", {
            "id":"friendsList-FriendID-" + id,
            "data":{status: status},
            "click":function(e) //online, show send message & remove friend
                    {
                        var clickMenuItems = [];
                        if (status === "online")
                        {
                            clickMenuItems.push({
                                item: "Send Message",
                                action: function()
                                {
									openWhisper(id, username, true);
									$("#friends-list-whisper-userID-"+id+" .send-whisper").focus();
									moveWhisperWindow(id, e.pageX, e.pageY);
                                }
                            });
                            clickMenuItems.push({
                                item: "Go To Room",
                                action: function()
                                {
									global.requestPartialPage("room", username, false);
                                }
                            });							
                        }
                        clickMenuItems.push({
                            item: "Remove Friend",
                            action: function()
                            {         
                                if (confirm("Are you sure you wish to remove " + username + "?"))
                                {
                                    friendsListSocket.sendCmd("remove-friend", {id: id});
                                }
                            }
                        });
                        clickMenu.create(clickMenuItems);
                        clickMenu.show(e.clientX, e.clientY);
                    }
        }).append($("<div/>",
            {
                "class":"username",                
                "html": username
            }).append($("<img>",{"class": "expand","src": "/images/social/expand.png", "height": "16", "width": "16"})));
        if (status == "online"){
            $("#friends-list-online-list").append(friend);
            $("#friends-list-online-count").html(parseInt($("#friends-list-online-count").html(), 10) + 1);
            //todo: give friend count online an ID isntead
            $($(ui).find(".friend-count .count")[0]).html(parseInt($($(ui).find(".friend-count .count")[0]).html(), 10) + 1);
        }
        else
        {
            $("#friends-list-offline-list").append(friend);
            $("#friends-list-offline-count").html(parseInt($("#friends-list-offline-count").html(), 10) + 1);
        }
    };
    this.removeFriend = function(id){
        var friend = $("#friendsList-FriendID-" + id);
        //decrement counter (li, ul, li, backdown to category-list
        var status = $(friend).data('status');
        if (status == "online")
        {
            $($(ui).find(".friend-count .count")[0]).html(parseInt($($(ui).find(".friend-count .count")[0]).html(), 10) - 1);
            $("#friends-list-online-count").html(parseInt($("#friends-list-online-count").html(), 10) - 1);
        }
        else
        {
            $("#friends-list-offline-count").html(parseInt($("#friends-list-offline-count").html(), 10) - 1);
        }
        $(friend).remove();
        
    };
    this.addSentRequest = function(id, username){
        var friend = $("<li/>", {
            "id":"friendsList-FriendID-" + id,
            "click":function(e) //online, show send message & remove friend
                    {
                        var clickMenuItems = [];
                        clickMenuItems.push({
                            item: "Cancel Request",
                            action: function()
                            {         
                                friendsListSocket.sendCmd("cancel-request", {id: id});
                            }
                        });
                        clickMenu.create(clickMenuItems);
                        clickMenu.show(e.clientX, e.clientY);
                    }
            }).append($("<div/>",
                {
                    "class":"username",                
                    "html": username
                }).append($("<img>",{"class": "expand","src": "/images/social/expand.png", "height": "16", "width": "16"})));
        $("#friends-list-sent-list").append(friend);
        $("#friends-list-sent-count").html(parseInt($("#friends-list-sent-count").html(), 10) + 1);
    };
    this.removeSentRequest = function(id){
        $("#friendsList-FriendID-" + id).remove();
        $("#friends-list-sent-count").html(parseInt($("#friends-list-sent-count").html(), 10) - 1);
    };
    this.addReceivedRequest = function(id, username){
        var friend = $("<li/>", {
            "id":"friendsList-FriendID-" + id,
            "click":function(e) //online, show send message & remove friend
                    {
                        var clickMenuItems = [];
                        clickMenuItems.push({
                            item: "Accept Request",
                            action: function()
                            {
                                friendsListSocket.sendCmd("accept-friend", {id: id});
                            }
                        });
                        clickMenuItems.push({
                            item: "Decline Request",
                            action: function()
                            {         
                                friendsListSocket.sendCmd("decline-friend", {id: id});
                            }
                        });                        
                        clickMenu.create(clickMenuItems);
                        clickMenu.show(e.clientX, e.clientY);
                    }
            }).append($("<div/>",
                {
                    "class":"username",                
                    "html": username
                }).append($("<img>",{"class": "expand","src": "/images/social/expand.png", "height": "16", "width": "16"})));
        $("#friends-list-received-list").append(friend);
        $("#friends-list-received-count").html(parseInt($("#friends-list-received-count").html(), 10) + 1);        
    };
    this.removeReceivedRequest = function(id, username){
        $("#friendsList-FriendID-" + id).remove();
        $("#friends-list-received-count").html(parseInt($("#friends-list-received-count").html(), 10) - 1);
    };
    this.online = function(id, username){
        this.removeFriend(id);
        this.addFriend(id, username, "online");
        //todo: add status message
    };
    this.offline = function(id, username){
        this.removeFriend(id);
        this.addFriend(id, username, "offline");
        //todo: add status message
    };
	this.whisper = function(id, username, message, action){
		addWhisper(id, username, message, action);
	};
    function addWhisperTab(id, username){
        var friend = $("<li/>", {
            "id":"friendsList-whispertab-FriendID-" + id,
            "click":function(e)
                    {
                        var clickMenuItems = [];
                        clickMenuItems.push({
                            item: "Open Window",
                            action: function()
                            {         
                                openWhisper(id, username, true);
								$("#friends-list-whisper-userID-"+id+" .send-whisper").focus();
                                moveWhisperWindow(id, e.pageX, e.pageY);
                            }
                        });
                        clickMenuItems.push({
                            item: "Close Window",
                            action: function()
                            {
                                closeWhisper(id);
                            }
                        });                        
                        clickMenu.create(clickMenuItems);
                        clickMenu.show(e.clientX, e.clientY);
                    }
        }).append($("<div/>",
            {
                "class":"username",                
                "html": username
            }).append($("<img>",{"class": "expand","src": "/images/social/expand.png", "height": "16", "width": "16"}))); 
        $("#friends-list-chatwindows-list").append(friend);
        $("#friends-list-chatwindow-count").html(parseInt($("#friends-list-chatwindow-count").html(), 10) + 1);
    };
    function removeWhisperTab(id){
        $("#friendsList-whispertab-FriendID-" + id).remove();
        $("#friends-list-chatwindow-count").html(parseInt($("#friends-list-chatwindow-count").html(), 10) - 1);
    };
    this.reset = function(id){
		$(ui).find(".category-list").empty();
		$(ui).find(".category-list").perfectScrollbar();
		$(ui).find(".category .category-count").html("0");
		$(ui).find(".friendsList-expand .friend-count .count").html("0");
    };
	//open whisper also creates the whisper, needed the ability to create the window but not show it
	//so a show parameter was added to save code
	function openWhisper(id, username, show){ 
		var windowId = "#friends-list-whisper-userID-"+id;
		if (!$(windowId).length)
		{
			$(".whisper-container").append(createWhisperWindow(id, username));
			$(windowId + " .whisper-box").perfectScrollbar();
			$(windowId).resizable({minHeight: 180, minWidth: 240, maxWidth: 360, maxHeight: 360, handles: "se", stop: function(){$(windowId+".whisper-box").perfectScrollbar("update");}});
			$(windowId).draggable({handle: $(windowId+" .whisper-window-title-bar"), containment: "document", stack: ".whisper-window"});
			$(windowId + " .send-whisper").keypress(function(e) {
				if ($(this).val().trim() != '' && e.which == 13) //message isn't empty and enter key pressed
				{
					friendsListSocket.sendCmd("whisper", {id: id, message: $(windowId + " .send-whisper").val()});
					$(windowId + " .send-whisper").val('');
				}
			});
			$(windowId).data("autoscroll", true);
//			$(windowId + " .whisper-box").on('scroll',function()
//			{
//				var scrollHeight = $(this)[0].scrollHeight,
//					scrollTop = $(this).scrollTop(),
//					height = $(this).height();
//				if ((scrollHeight - scrollTop) < height*1.1){
//					$(windowId).data("autoscroll", true);
//				}else{
//					$(windowId).data("autoscroll", true); //atm: just always auto scroll, let's just see how bad it is.
//					//$(windowId).data("autoscroll", false);
//				}
//			});
			$(windowId+" .close").click(function(){$(windowId).fadeOut();});
			addWhisperTab(id, username);
		}
		if (show)
		{
			$(windowId).show();
		}
	}
	function closeWhisper(id){
		var windowId = "#friends-list-whisper-userID-"+id;
		$(windowId).remove();
		removeWhisperTab(id);
	}	
	function moveWhisperWindow(id, x, y){
		//TEMP FIX: OFFSET THE FRIENDS LIST DROP DOWN MENU SINCE THAT SEEMS TO BE 0 LEFT AND 0 TOP
		var offsetX = $(".friendsList").offset().left;
		var offsetY = $(".friendsList").offset().top;
		var windowId = "#friends-list-whisper-userID-"+id;
		$(windowId).css("top", y - offsetY - 100); //-100 pixels to bring the window 100 square pixels above the cursor
		$(windowId).css("left", x - offsetX - 100);
	};
	function addWhisper(id, username, message, action){
		var window = "#friends-list-whisper-userID-"+id;
		openWhisper(id, username, false);
		var whisper = $("<div/>", {"class":"whisper " + action});
			whisper.append($("<span/>",{"class":"username", "html":username + ":"}));
			whisper.append($("<span/>",{"class":"message", "html":message}));
		$(window + " .whisper-box").append(whisper);
		$(window+" .whisper-box").perfectScrollbar("update");
		if ($(window).data("autoscroll")) {
			var textarea = document.getElementById('friends-list-whisper-userID-'+id).getElementsByClassName("whisper-box")[0];
			textarea.scrollTop = textarea.scrollHeight;
		}
	}
	function createWhisperWindow(id, username){
			//**** Entire Container
			var whisperWindow = $("<div/>", {
					"class":"whisper-window",
					"id":"friends-list-whisper-userID-"+id
			});
			//****
			//**** TITLE BAR
			var titleBar = $("<div/>",
			{
					"class":"whisper-window-title-bar"
			}).append($("<div/>",{"class":"close"})).append($("<div/>",{"class":"window-title", "html":"Messaging " + username}));
			//****
			//**** WHISPER WINDOW CONTENT
			var whisperWindowContent = $("<div/>", {
					"class":"whisper-window-content"
			}).append($("<div/>", {"class":"whisper-box"}))
							.append($("<input/>",{
							"class":"send-whisper",
							"placeholder":"Send Message...",
							"type":"text",
							"maxlength":"240"}));

			//****

			whisperWindow.append(titleBar);
			whisperWindow.append(whisperWindowContent)
			return whisperWindow;
	}
}
function friendsList(){
    //var server = window.location.hostname + ":37999";
	var server = "http://chat.instasynch.com:37999"
    var socket = null;
    this.user = null; //this users info (i.e. username)
    var thisSocket = this; //for callbacks
	socket = io.connect(server, 
    {
        reconnect: true,
        "force new connection": false,
        "try multiple transports": true,
        "reconnection delay": 1000,
        "max reconnection attempts": 5,
        "auto connect": false
    });
    this.disconnect = function () {
        socket.disconnect();
    };
    this.connect = function () {
        socket.socket.connect();
    };
    this.sendCmd = function(command, data)
    {
        socket.emit(command, data);
    };
    socket.on('connecting', function () {
    });
    socket.on('connect', function () {
        socket.emit('join', {username: $['cookie']('username'), sessionid: $['cookie']('sessionid')}); //Requires jquery.cookie.js
    });
    socket.on('success', function (data){
        thisSocket.user = data.user;
        for(var friend in data.friendslist) 
        {
            thisFriendsListUI.addFriend(data.friendslist[friend].id, data.friendslist[friend].username, data.friendslist[friend].status);
        }
        for(var sentRequest in data.friendRequests.sent) 
        {
            thisFriendsListUI.addSentRequest(data.friendRequests.sent[sentRequest].id, data.friendRequests.sent[sentRequest].username);
        }   
        for(var receivedRequest in data.friendRequests.received) 
        {
            thisFriendsListUI.addReceivedRequest(data.friendRequests.received[receivedRequest].id, data.friendRequests.received[receivedRequest].username);
        }
    });   
    socket.on('whisper', function (data){
        thisFriendsListUI.whisper(data.id, data.username, data.message, data.action);
    });            
    socket.on('reconnecting', function (data) {
		
	});
    socket.on('reconnected', function (data) {});
    socket.on('disconnect', function (data){
        thisFriendsListUI.reset();
    });       
    socket.on('online', function (data){
        thisFriendsListUI.online(data.id, data.username);
    });
    socket.on('offline', function (data){
        thisFriendsListUI.offline(data.id, data.username);
    });
    socket.on('pending-sent', function (data){
        thisFriendsListUI.addSentRequest(data.id, data.username);
    });   
    socket.on('pending-received', function (data){
        thisFriendsListUI.addReceivedRequest(data.id, data.username);
    }); 
    socket.on('remove-pending-sent', function (data){
        thisFriendsListUI.removeSentRequest(data.id);
    });
    socket.on('remove-pending-received', function (data){
        thisFriendsListUI.removeReceivedRequest(data.id);
    });            
    socket.on('add-friend', function(data)
    {
        thisFriendsListUI.addFriend(data.id, data.username, data.status);
    });  
    socket.on('remove-friend', function(data)
    {
        thisFriendsListUI.removeFriend(data.id);
    });                
}    

} //end loadService function

})();