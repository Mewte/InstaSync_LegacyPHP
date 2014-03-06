/*
    <InstaSynch - Watch Videos with friends.>
    Copyright (C) 2013  InstaSynch
*/
function register()
{
    var username = $("#username").val();
    var password = $("#password").val();
    var confirmPass = $("#confirmPassword").val();
    var email = $("#email").val();
    if(username.match(/^([A-Za-z0-9]|([-_](?![-_]))){1,16}$/) == null)
    {
        $(".formmsg").html("5-16 char and A-Z, 1-9, - _");
        return;                    
    }
    if (password != confirmPass)
    {
        $(".formmsg").html("Passwords do not match.");
        return;                    
    }

    $.post("/ajax/register.php", {username: username, password: password, email: email}).done(function(data)
    {
        var result = JSON.parse(data);
        if (result.success)
            window.location = document.URL;
        else
            $(".formmsg").html(result.error);
    });
}
function login()
{
    var username = $("#loginUsername").val();
    var password = $("#loginPassword").val();
    $.post("/ajax/login.php", {username: username, password: password}).done(function(data)
    {
        var result = JSON.parse(data);
        console.log(result);
        if (result.success)
        {
            window.location.hash = "";
            window.location = document.URL.replace("#", "");
        }
        else
        {
            $("#loginerror").html(result.error);
            $("#loginerror").show();
            $("#loginerror").fadeOut(3500);
        }
    });
}
function checkLogin(callback)
{
    if ($.cookie("username") === undefined || $.cookie("sessionid") === undefined) //missing cookies, automatically not logged in
    {
        callback(false); //not logged in
    }
    else
    {
        $.get("/ajax/checklogin.php").done(function(data)
        {
            var result = JSON.parse(data);
            callback(result.loggedin, result.username, result.avatar, result.bio, result.social);
        });
    }
}
function getRoomInfo(room, callback)
{
    $.get("/ajax/roominfo.php?room=" + room).done(function(data)
    {
        var result = JSON.parse(data);
        callback(result.listing, result.description, result.info, result.error);
    });
}
function getUserInfo(username, callback)
{
    $.get("/ajax/userinfo.php?username=" + username).done(function(data)
    {
        var result = JSON.parse(data);
        callback(result.avatar, result.bio, result.error);
    });
}
function setUserInfo(avatar, bio, social, callback)
{
    $.post("/ajax/userinfo.php", {avatar: avatar, bio: bio, social: social}).done(function(data)
    {
        var result = JSON.parse(data); 
        callback(result.error);
    });
}