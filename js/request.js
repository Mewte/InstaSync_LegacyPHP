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
        $(".formmsg").html("5-16 char and A-Z, 0-9, - _");
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
/*
 * first parameter of callback is.. error.. it makes sense to have that actually be success
 */
function getVideoInfo(video, callback){
	if (video.provider == "youtube"){
		$.get("http://gdata.youtube.com/feeds/api/videos/" + video.id + "?v=2&alt=json").done(function(data){
			callback(false, data);
		}).fail(function(){
			callback(true);
		});
	}
	else if (video.provider == "vimeo"){
		$.get("http://vimeo.com/api/v2/video/" + video.id + ".json").done(function(data){
			callback(false, data);
		}).fail(function(){
			callback(true);
		});		
	}
}
/*
 * first parameter of callback is success or nonsuccess
 */
function getYoutubeSearch(parameters, callback){
	var url = "http://gdata.youtube.com/feeds/api/videos?alt=json&v=2&q="
				+encodeURIComponent(parameters.query)
				+"&start-index="+parameters.startIndex
				+"&max-results="+parameters.maxResults
				+"&fields=entry(title,author,yt:statistics,yt:rating,media:group(yt:duration,yt:videoid))";
	$.get(url).done(function(data){
		callback(true, data.feed.entry);
	}).fail(function(){
		callback(false);
	});
}
function getComments(video, startIndex, endIndex){
	
}