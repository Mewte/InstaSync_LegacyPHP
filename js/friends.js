(function(){
$(document).ready(function()
{
    var friendsListSocket = new friendsList();
    var thisFriendsListUI = new friendsListUI($(".friendsList"), friendsListSocket);
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
            }});
    });
    thisFriendsListUI.addFriend(1, "Mewte", "online");
    thisFriendsListUI.addFriend(2, "Senpai", "online");
});
$(document).scroll(function(e) {
    $('.friendsList').css({'top': $(document).scrollTop() + 10});
});
function contextMenu(element)
{
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
        $(domElement).mouseleave(function(){$(this).hide()});
    };
    this.show = function(x, y)
    {
        $(domElement).show();
        $(domElement).css("left", x - ($(domElement).width() / 2));
        $(domElement).css("top",y - ($(domElement).height() / 2));
    };
    this.hide = function()
    {
        $(domElement).hide();
    };
}
function friendsListUI(domElement, friendsListSocket)
{
    var ui = domElement;
    var clickMenu = new contextMenu($(".context-menu"));
    this.addFriend = function(id, username, status){
        var friend = $("<li/>", {
            "click":function(e) //online, show send message & remove friend
                    {
                        var clickMenuItems = [];
                        if (status === "online")
                        {
                            clickMenuItems.push({
                                item: "Sent Message",
                                action: function()
                                {         

                                }
                            });
                        }
                        clickMenuItems.push({
                                item: "Remove Friend",
                                action: function()
                                {         
                                    if (confirm("Are you sure you wish to remove " + username + "?"))
                                    {
                                        friendsListSocket.emit("remove-friend", {id: id});
                                    }
                                }
                            });
                        clickMenu.create(clickMenuItems);
                        clickMenu.show(e.clientX, e.clientY);
                    }
        }).append($("<div/>",
            {
                "class":"username",
                "id":"friendsList-FriendID:" + id,
                "html": username
            }).append($("<img>",{"class": "expand","src": "/images/social/expand.png", "height": "16", "width": "16"})));
        if (status == "online"){
            $("#friends-list-online-list").append(friend);
            $("#friends-list-online-count").html(parseInt($("#friends-list-online-count").html(), 10) + 1);
        }
        else
        {
            $("#friends-list-offline-list").append(friend);
            $("#friends-list-offline-count").html(parseInt($("#friends-list-offline-count").html(), 10) + 1);
        }
    };
    this.removeFriend = function(id, username){
        
    };
    this.addSentRequest = function(id, username)
    {
        
    };
    this.removeSentRequest = function(id, username)
    {
        
    };
    this.addReceivedRequest = function(id, username)
    {
        
    };
    this.removeReceivedRequest = function(id, username)
    {
        
    };
    this.online = function(id)
    {
        
    };
    this.offline = function(id)
    {
        
    };
    this.clear = function(id)
    {
        $(ui).empty();
    };
    
}
function friendsList(){
    var server = window.location.hostname + ":37999";
    var socket = null;
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
    socket.on('connecting', function () {
    });
    socket.on('connect', function () {
        socket.emit('join', {username: username, sessionid: sessionid});
    });
    socket.on('success', function (data){
        var online = 0;
        for(var friend in data.friendslist) 
        {
            if (data.friendslist[friend].status == "online")
            {
                online++;
            }
        }
        alert(online + " friends online.");
    });   
    socket.on('whisper', function (data){
        
    });            
    socket.on('reconnecting', function (data) {});
    socket.on('reconnected', function (data) {});
    socket.on('disconnect', function (data){
        
    });       
    socket.on('online', function (data){
        
    });
    socket.on('offline', function (data){
        
    });
    socket.on('pending-sent', function (data){
        
    });   
    socket.on('pending-received', function (data){
        
    }); 
    socket.on('remove-pending-sent', function (data){
        
    });
    socket.on('remove-pending-received', function (data){
        
    });            
    socket.on('add-friend', function(data)
    {
        
    });  
    socket.on('remove-friend', function(data)
    {
       
    });                
}    
})();
