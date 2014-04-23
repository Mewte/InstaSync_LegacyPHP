<?php
    require dirname(__FILE__) . "/../includes/connect.php";
	$output = "";	
    if (isset($_GET["room"]))
    {
        $db = createDb();
        $room = $_GET["room"];    
        $query = $db->prepare("select room.*, user.username as roomname from rooms as room JOIN users as user
									ON room.room_id = user.id
								where user.username = :room limit 1");
		$query->execute(array("room"=>$room));
        if ($room = $query->fetch(PDO::FETCH_ASSOC))
        {
            $output["description"] = htmlspecialchars($room["description"]);
            $output["info"] = htmlspecialchars($room["info"]);
            $output["listing"] = htmlspecialchars($room["listing"]);
        }
        else
        {
            $output["error"] = "Room not found.";           
        }
        
        echo json_encode($output);        
    }
    elseif (isset($_POST["listing"], $_POST["description"], $_POST["info"]))
    {
        if (isset($_COOKIE["username"], $_COOKIE["sessionid"]))
        {
            $db = createDb();
            $username = $_COOKIE["username"];
            $sessionid = $_COOKIE["sessionid"];        
            $listing = $_POST["listing"];
            $description = $_POST["description"];
            $info = $_POST["info"];
			
			$query = $db->prepare("update rooms as room JOIN users as user ON room.room_id = user.id
									set listing = :listing, description = :description, info = :info
									where user.username = :username and user.cookie = :sessionid");
			$query->execute(array(
				"listing"=>$listing,
				"description"=>$description,
				"info"=>$info,
				"username"=>$username,
				"sessionid" => $sessionid
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
        else
        {
            $output["error"] = "You are not logged in.";
        }
        echo json_encode($output); 
    }
?>