function friendsList()
{
    this.friends = {};
    this.length = 0;
}
friendsList.prototype.addFriend = function(id, username, status)
{
    this.friends[id] = {id: id, username: username, status: status};
    this.length++;
};
friendsList.prototype.removeFriend = function(id)
{
    delete this.friends[id];
    this.length--;
};
friendsList.prototype.isFriend = function(id)
{
    if (this.friends[id] != undefined)
        return true;
    else
        return false;
}
friendsList.prototype.online = function(id)
{
    if (this.friends[id] != undefined)
        this.friends[id].status = "online";
}
friendsList.prototype.offline = function(id)
{
    if (this.friends[id] != undefined)
        this.friends[id].status = "offline";
}
module.exports = friendsList;