var io =  require('socket.io');
var connect = require('connect');
var app = connect().use(connect.static('public')).listen(37999);
var crypto = require('crypto');
var mysql = require('mysql');
var friendsList = require('./objects/friendsList');
var friendRequests = require('./objects/friendRequests');
var queries = require('./objects/queries');
queries = new queries();

global.friends_list = io.listen(app, {"log level": 2, "heartbeat timeout": 12, "heartbeat interval": 5, "close timeout": 12, "transports": ['websocket']});
app.setMaxListeners(0);

/*------------------------------
    [SOCKET RELATED STUFF]
*/
var fs = require('fs');
process.on('uncaughtException', function (error) {
    console.log("UNHANDLED ERROR! Logged to file.");
    fs.appendFile("crashlog.txt", error.stack + "---END OF ERROR----");
});
function db()
{
    return mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'bibbytube'
    });
}

var users = {}; //store friendslist and num of connected sockets here.

friends_list.sockets.on('connection', function(socket)
{
    socket.connected = true;
    socket.user = null;
    socket.joined = false;
    socket.joinEmitted = false;
    socket.on("join", function(data)
    {
        if (data.username != undefined && data.sessionid != undefined && socket.joinEmitted == false)
        {                      
            var connection = db();
            connection.connect();
            connection.query(queries.loggedInQuery, [data.username, data.sessionid],function(err, user, fields) 
            {
                if (err) { connection.end(); throw err;}
                if (user.length == 1)
                {
                    socket.user = user[0];
                    connection.query(queries.friendsListQuery,[socket.user.id, socket.user.id],function(err, friends, fields)//friends list
                    {
                        if (err) { connection.end(); throw err;}
                        connection.query(queries.friendRequestQuery,[socket.user.id, socket.user.id],function(err, friendRequest, fields)
                        {
                            if (err) { connection.end(); throw err;}
                            if (socket.connected)
                            {
								var userObject = {};
								userObject.friendsList = new friendsList();
								userObject.friendRequests = new friendRequests();
								if (users[socket.user.id] != undefined && users[socket.user.id].count > 0) //maybe if count is somehow less than 0, reset
								{
									userObject.count = users[socket.user.id].count;
								}
								else
								{
									userObject.count = 0;
								}
								users[socket.user.id] = userObject;
								
                                for (i = 0; i < friends.length; i++) //load friends list
                                {
                                    var status = "";
                                    if (users[friends[i].id] == undefined)
                                    {
                                        status = "offline";
                                    }
                                    else
                                    {
                                        users[friends[i].id].friendsList.online(socket.user.id);
                                        status = "online";
                                    }
                                    userObject.friendsList.addFriend(friends[i].id, friends[i].username, status);
                                    socket.join("id:"+friends[i].id);
                                }
                                for (i = 0; i < friendRequest.length; i++) //load friend requests
                                {
                                    if (friendRequest[i].sentBy == socket.user.id)
                                    {
                                        userObject.friendRequests.add(friendRequest[i].id, friendRequest[i].username, "sent");
                                    }
                                    else
                                    {
                                        userObject.friendRequests.add(friendRequest[i].id, friendRequest[i].username, "received");
                                    }
                                }
								if (users[socket.user.id].count == 0)
								{
									friends_list.sockets.in("id:"+socket.user.id).emit('online', {username: socket.user.username, id: socket.user.id});
								}
								socket.join("userClientsID:"+socket.user.id);
                                socket.emit('success', {friendslist: users[socket.user.id].friendsList.friends, friendRequests: users[socket.user.id].friendRequests.get(), user: socket.user});
                                users[socket.user.id].count++;
								setSocketEvents();
                            }
                            connection.end();
                        });                                                
                    });
                }
                else //not signed in
                {
                    
                }
            });
        }
        socket.joinEmitted = true;
    });
    socket.on('disconnect', function()
    {
        socket.connected = false;
    });
    function setSocketEvents()
    {
        socket.on('disconnect', function()
        {
            socket.connected = false;
			users[socket.user.id].count--;
			if (users[socket.user.id].count < 1)
			{
				friends_list.sockets.in("id:"+socket.user.id).emit('offline', {username: socket.user.username, id: socket.user.id});
				for(var friend in users[socket.user.id].friendsList.friends) {
					if (users[friend] != undefined)
					{
						users[friend].friendsList.offline(socket.user.id);
					}
				}
				delete users[socket.user.id];
			}
        });
        socket.on('add-friend', function(data)
        {
            if (data.username != undefined)
            {
                if (users[socket.user.id].friendsList.length <= 50)
                {
                    var connection = db();
                    connection.connect();
                    connection.query(queries.queryByUsername, [data.username],function(err, user, fields) 
                    {
                        if (err) { connection.end(); throw err;}
                        if (user.length == 1) //user found
                        {
                            var friend = user[0];
                            if (!users[socket.user.id].friendsList.isFriend(friend.id) && friend.id != socket.user.id)
                            {
                                if(!users[socket.user.id].friendRequests.exist(friend.id,"received"))
                                {

                                    var userA = Math.min(friend.id, socket.user.id);
                                    var userB = Math.max(friend.id, socket.user.id);
                                    var sentBy = socket.user.id;
                                    connection.query(queries.friendRequestInsert,[userA, userB, sentBy],function(err)
                                    {

                                        if (err)
                                        {
                                            if (err.code == "ER_DUP_ENTRY")
                                            {
                                                //already friend requested
                                                connection.end();
                                            }
                                            else
                                            {
                                                connection.end(); 
                                                throw err;
                                            }
                                        }
                                        else
                                        {
                                            friends_list.sockets.in("userClientsID:"+socket.user.id).emit('pending-sent', {username: friend.username, id: friend.id});
                                            users[socket.user.id].friendRequests.add(friend.id, friend.username, "sent");
                                            if (users[friend.id] != undefined)
                                            {
                                                friends_list.sockets.in("userClientsID:"+friend.id).emit('pending-received', {username: socket.user.username, id: socket.user.id});
                                                users[friend.id].friendRequests.add(socket.user.id, socket.user.username, "received");
                                            }
                                        }
                                        connection.end();
                                    });
                                }
                                else
                                {
                                    //already have a friend request waiting from this friend
                                }
                            }
                            else
                            {
                                //already friends
                            }
                        }
                    });
                }
                else
                {
                    //too many friends
                }
            }
        });
        socket.on('remove-friend', function(data)
        {
            if (data.id != undefined)
            {
                if (users[socket.user.id].friendsList.isFriend(data.id))
                {
                    var connection = db();
                    connection.connect();
                    var friend = users[socket.user.id].friendsList.friends[data.id];
                    var userA = Math.min(friend.id, socket.user.id);
                    var userB = Math.max(friend.id, socket.user.id);
                    connection.query(queries.removeFriends,[userA, userB],function(err)
                    {   
                        if (err){connection.end();throw err;}
                        else
                        {
                            if (users[friend.id] != undefined)
                            {
                                users[friend.id].friendsList.removeFriend(socket.user.id);
                                friends_list.sockets.in("userClientsID:"+friend.id).emit("remove-friend", {id: socket.user.id});
								friends_list.sockets.clients("userClientsID:"+friend.id).forEach(function (friendSocket) {
									friendSocket.leave("id:"+socket.user.id); //itterate through friend sockets and make them leave this users room
								});
                            }
							users[socket.user.id].friendsList.removeFriend(friend.id);
							friends_list.sockets.in("userClientsID:"+socket.user.id).emit("remove-friend", {id: friend.id});
							friends_list.sockets.clients("userClientsID:"+socket.user.id).forEach(function (socket) {
								socket.leave("id:"+friend.id)
							});
                        }
                    });
                    
                }
            }
        });
        socket.on('accept-friend', function(data)
        {
            if (data.id != undefined)
            {        
                if (users[socket.user.id].friendsList.length <= 50)
                {
                    if (users[socket.user.id].friendRequests.exist(data.id, "received"))
                    {
                        var connection = db();
                        connection.connect();
                        var friend = users[socket.user.id].friendRequests.get().received[data.id];
                        var userA = Math.min(friend.id, socket.user.id);
                        var userB = Math.max(friend.id, socket.user.id);
                        var sentBy = data.id;
                        connection.query(queries.removeRequests,[userA, userB],function(err)
                        {   
                            if (err){connection.end();throw err;}
                            else
                            {
                                //friend requests removed from database so remove them from the socket data.
                                users[socket.user.id].friendRequests.remove(data.id, "received");
                                friends_list.sockets.in("userClientsID:"+socket.user.id).emit("remove-pending-received", {id: friend.id});
                                if (users[data.id] != undefined)
                                {
									users[friend.id].friendRequests.remove(socket.user.id, "sent");
									friends_list.sockets.in("userClientsID:"+friend.id).emit("remove-pending-sent", {id: socket.user.id});
                                }
								connection.query(queries.addFriends, [userA, userB, sentBy], function(err)
                                {
									if (err){connection.end();throw err;}
                                    else
                                    {
                                        var status = "offline";
                                        if (users[friend.id] != undefined)
                                        {
                                            status = "online";
                                            users[friend.id].friendsList.addFriend(socket.user.id, socket.user.username, status);
                                            friends_list.sockets.in("userClientsID:"+friend.id).emit("add-friend", {id: socket.user.id, username: socket.user.username, status: "online"});
                                            friends_list.sockets.clients("userClientsID:"+friend.id).forEach(function (friendSocket) {
												friendSocket.join("id:"+socket.user.id);
											});
                                        }
                                        users[socket.user.id].friendsList.addFriend(friend.id, friend.username, status);
										friends_list.sockets.in("userClientsID:"+socket.user.id).emit("add-friend", {id: friend.id, username: friend.username, status: status});
										friends_list.sockets.clients("userClientsID:"+socket.user.id).forEach(function (socket) {
											socket.join("id:"+friend.id);
										});										
                                    }
                                    connection.end();
                                });
                            }
                        });
                    }
                    else
                    {
                        //no request from this id
                    }
                }
                else
                {
                    //too many friends
                }
            }
        });
        socket.on('decline-friend', function(data)
        {
            if (data.id != undefined)
            {
                if (users[socket.user.id].friendRequests.exist(data.id, "received"))
                {
                    var connection = db();
                    connection.connect();
                    var friend = users[socket.user.id].friendRequests.get().received[data.id];
                    var userA = Math.min(friend.id, socket.user.id);
                    var userB = Math.max(friend.id, socket.user.id);
                    connection.query(queries.removeRequests, [userA, userB], function(err)
                    {
                        if (err)
                        {
                            connection.end();
                            throw err;
                        }
                        else
						{
                            users[socket.user.id].friendRequests.remove(data.id, "received");
                            friends_list.sockets.in("userClientsID:"+socket.user.id).emit("remove-pending-received", {id: friend.id});
                            if (users[friend.id] != undefined)
                            {
								users[friend.id].friendRequests.remove(socket.user.id, "sent");
                                friends_list.sockets.in("userClientsID:"+friend.id).emit("remove-pending-sent", {id: socket.user.id});
                            }
                        }
                        connection.end();
                    });                    
                }
                else
                {
                    //no friend request from this person
                }
            }
        });   
        socket.on('cancel-request', function(data)
        {
            if (data.id != undefined)
            {
                if (users[socket.user.id].friendRequests.exist(data.id,"sent"))
                {
                    var connection = db();
                    connection.connect();
                    var friend = users[socket.user.id].friendRequests.get().sent[data.id];
                    var userA = Math.min(friend.id, socket.user.id);
                    var userB = Math.max(friend.id, socket.user.id);
                    connection.query(queries.removeRequests,[userA, userB],function(err)
                    {
                        if (err){ connection.end(); throw err;}
                        else
                        {
                            users[socket.user.id].friendRequests.remove(data.id, "sent");
                            friends_list.sockets.in("userClientsID:"+socket.user.id).emit("remove-pending-sent", {id: friend.id});
                            if (users[friend.id] != undefined)
                            {;
                                users[friend.id].friendRequests.remove(socket.user.id, "received");
                                friends_list.sockets.in("userClientsID:"+friend.id).emit("remove-pending-received", {id: socket.user.id});
                            }
                        }
                        connection.end();
                    });
                }
            }
        });
        socket.on('whisper', function(data)
        {
            if (data.id !== undefined && data.message != undefined)
            {
                if (users[socket.user.id].friendsList.isFriend(data.id))
                {
                    //check if friends
                    if (users[data.id] !== undefined)
                    {
                        if (users[data.id].friendsList.isFriend(socket.user.id)) //double verify
                        {
                            friends_list.sockets.in("userClientsID:"+data.id).emit('whisper', {message: replaceTags(data.message), id: socket.user.id, username: socket.user.username, action: "received"});
                            friends_list.sockets.in("userClientsID:"+socket.user.id).emit('whisper', {message: replaceTags(data.message), id: data.id, username: socket.user.username, action: "sent"});
                            //TODO
                            //If reciever verifies message recieved, THEN tell the sender it's been recieved
                        }
                    }
                    else
                    {
                        //friend not online
                    }
                }
            }            
        });
        socket.on('whisper-confirmation', function(data){
            if (data.messageId != undefined && data.userId != undefined)
            {
                
            }
        });
        socket.on('log', function(data)
        {
           //log various data here on demand
        });
    }
});
function replaceTags(message){ //xss protection
    var tagsToReplace = {
        '<': '&lt;',
        '>': '&gt;'
    };
    var regex = new RegExp("["+Object.keys(tagsToReplace).join("") + "]","g");
    message = message.replace(regex, function replaceTag(tag) {return tagsToReplace[tag] || tag; });
    return message;
}