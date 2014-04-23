<?php
    require dirname(__FILE__) . "/../includes/connect.php";
	$output = "";	
    if (isset($_GET["username"]))
    {
        $db = createDb();
        $username = $_GET["username"];
		$query = $db->prepare("select avatar, bio from users where username = :username");
		$query->execute(array("username"=>$username));

        if ($user = $query->fetch(PDO::FETCH_ASSOC))
        {
            $output["avatar"] = "http://i.imgur.com/" . $user["avatar"] . ".jpg";
            $output["bio"] = htmlspecialchars($user["bio"]);
        }
        else
        {
            $output["error"] = "User not found.";           
        }        
    }
    elseif (isset($_POST["avatar"], $_POST["bio"], $_POST["social"]))
    {
        if (isset($_COOKIE["username"], $_COOKIE["sessionid"]))
        {
            $db = createDb();
            $username = $_COOKIE["username"];
            $sessionid = $_COOKIE["sessionid"];        
            $avatar = imgurCode($_POST["avatar"]);
            $bio = $_POST["bio"];
			$social = $_POST["social"];
            if ($avatar != false && $bio != "")
            {
                $query = $db->prepare("update users set
										avatar = :avatar, 
										bio = :bio,
										social = :social
										where username = :username and cookie = :sessionid limit 1");
                $query->execute(array(
					"avatar"=>$avatar,
					"bio"=>$bio,
					"social"=>$social,
					"username"=>$username,
					"sessionid"=>$sessionid
				));
                if ($query->rowCount() === 1)
                {
                    $output["error"] = "Changes successfully made to: {$username}.";
                }
                else
                {
                    $output["error"] = "Error saving settings, try logging back in.";
                }
            }  
            elseif ($avatar === false)
            {
                $output["error"] = "Invalid IMGUR URL.";
            }
            elseif ($bio === "")
            {
                $output["error"] = "Bio cannot be empty.";
            }
            
        }
        else
        {
            $output["error"] = "Cookies not set. Please log in again.";
        }
    }
    echo json_encode($output);

    function imgurCode($url)
    {
        return preg_replace("/(https?:\/\/)?(www\.)?(i\.)?imgur\.com\/(gallery\/)?([a-zA-Z0-9]+)(\.(jpg|jpeg|png|gif))?/i","$5", $url);    
    }    
?>