function friendRequests()
{
    this.sent = {};
    this.received = {};
}
friendRequests.prototype.add = function(userId, username, type)
{
    if (type == "sent")
    {
        this.sent[userId] = {username: username, id: userId};
    }
    else if (type == "received")
    {
        this.received[userId] = {username: username, id: userId};
    }
}
friendRequests.prototype.remove = function(userId, type)
{
    if (this[type] != undefined)
    {
        delete this[type][userId];
    }
}
friendRequests.prototype.exist = function(userId, type)
{
    if (type == "sent")
    {
        return !(this.sent[userId] == undefined);
    }
    else if (type == "received")
    {
        return !(this.received[userId] == undefined);
    }
}
friendRequests.prototype.get = function()
{
    return {sent: this.sent, received: this.received};
}
module.exports = friendRequests;