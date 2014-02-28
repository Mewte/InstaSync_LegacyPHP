//MySQL Queries in one nice location
function queries()
{
    this.loggedInQuery = "SELECT id, username FROM users WHERE username = ? AND cookie = ?"; //logged in
    this.friendsListQuery = "select id, username from \n\
           (select userA as friend FROM friends_list where userB = ? \n\
           UNION \n\
           select userB as friend FROM friends_list where userA = ?) \n\
           a \n\
           join users on users.id = a.friend;";
    this.friendRequestQuery = "select id, username, a.sentBy from \n\
                                (select userA as friend, sentBy FROM friend_requests where userB = ? \n\
                                UNION \n\
                                select userB as friend, sentBy FROM friend_requests where userA = ?) \n\
                                a \n\
                                join users on users.id = a.friend;";
    this.queryByUsername = "select id, username from users where username = ?";
    this.friendRequestInsert = "insert into friend_requests (userA, userB, sentBy) values (?,?,?);";
    this.removeRequests = "delete from friend_requests where userA = ? AND userB = ?;";
    this.addFriends = "insert into friends_list (userA, userB, sentBy) values (?,?,?);";
    this.removeFriends = "delete from friends_list where userA = ? AND userB = ?";
}
module.exports = queries;