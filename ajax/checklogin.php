<?php
    require dirname(__FILE__) . "/../includes/connect.php";
    if (isset($_COOKIE["username"], $_COOKIE["sessionid"])) //check if valid
    {
        mysql_select_db("bibbytube", $connection);
        $username = mysql_real_escape_string($_COOKIE["username"]);
        $sessionid = mysql_real_escape_string($_COOKIE["sessionid"]);        
        $userLookup = mysql_query("select username, avatar, bio, social from users 
                           where 
                           username = '{$username}' 
                           and cookie = '{$sessionid}'");
        $output = "";
        if ($user = mysql_fetch_array($userLookup, MYSQL_ASSOC))//user logged in
        {
            $output["loggedin"] = true;
            $output["username"] = $user["username"];
            $output["avatar"] = "http://i.imgur.com/" . $user["avatar"] . ".jpg";
            $output["bio"] = htmlspecialchars($user["bio"]);
			$output["social"] = $user["social"];

        }
        else
        {
            $output["loggedin"] = false;            
        }
        
        echo json_encode($output);
    }    
    mysql_close($connection);
?>
