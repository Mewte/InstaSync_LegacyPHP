<?php
    require dirname(__FILE__) . "/../includes/connect.php";
    if (isset($_COOKIE["username"], $_COOKIE["sessionid"])) //check if valid
    {
		$db = createDb();
        $username = $_COOKIE["username"];
        $sessionid = $_COOKIE["sessionid"];
		$query = $db->prepare("select username, avatar, bio, social from users
								where username = :username and cookie = :cookie");
		$query->execute(array("username"=>$username, "cookie"=>$sessionid));
		$user = $query->fetch(PDO::FETCH_ASSOC);
        $output = "";
        if ($user)//user logged in
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
?>
