<?php
/*
 * THIS FILE PARSES INFO IT RECIEVES AND RETURNS A JSON OBJECT OF THAT USER
*/
   require dirname(__FILE__) . "/../includes/connect.php";
   if (isset($_POST["username"], $_POST["ip"], $_POST["cookie"], $_POST["room"]))
   {
        $username = trim($_POST["username"]);   
        $cookie = $_POST["cookie"];         
        $room = $_POST["room"];         
        $ip = $_POST["ip"];
        $output = array();
    
        //error checking
		if (!isToxic($ip)){
			$db = createDb();
			if (roomExist($room, $db)){
				$user = getUser($username, $cookie, $room, $db);
				if (!isBanned($user, $ip, $room, $db)){
					$output['user'] = $user;
				}
				else{
					$output['error'] = "Banned";
				}
			}
			else{
				$output["error"] = "Room does not exist.";
			}
		}
		else{
			$output["error"] = "In an attempt to limit the number of ban evaders, I've had to black list IPs commonly by used email and forum spammers. Your IP was in this black list and marked as toxic. I'd recomend contacting your ISP and asking for a new IP address as this could be an indication that your IP was used for illegal spamming. Your ip cannot be removed from this list by me. If you have further questions please contact admin@instasynch.com, thank you. ";
		}
        echo json_encode($output);
   }
   function roomExist($name, $db)
   {
	   $query = $db->prepare("select * from rooms where room_name = :room");
	   $query->execute(array("room"=>$name));
       if ($query->fetch(PDO::FETCH_ASSOC))
       {
			return true;
       }
       else
       {
           return false;
       }
   }
   /*
    * Gets username, logged in, and permissions
    */
   function getUser($username, $cookie, $room, $db){
	   $query = $db->prepare("select mods.permissions from users as user 
								LEFT JOIN mods on user.username = mods.username and mods.room_name = :room
								WHERE user.username = :username and user.cookie = :cookie");
	   $query->execute(array("username"=>$username, "cookie"=>$cookie, "room"=>$room));
	   $user = $query->fetch(PDO::FETCH_ASSOC);
	   if ($user){
		   if ($user['permissions'] == NULL){
			   $permissions = strtolower($username) == strtolower($room) ? 2 : 0; //if room owner, 2, else 0
		   }
		   else{
			   $permissions = $user['permissions'];
		   }
		   return array("username"=>$username, "loggedin"=>true, "permissions"=>$permissions);
	   }
	   else{
		   return array("username"=>"unnamed", "loggedin"=>false, "permissions"=>0);
	   }
   }
   function isBanned($user, $ip, $room, $db){
	   if ($user['loggedin']){
		   if ($user['permissions'] > 0){
			   return false;
		   }
		   else{
			   $query = $db->prepare("select ban.*, user.username from bans as ban 
										left join users as user on ban.user_id = user.id
										where ban.room_name = :room and (user.username = :username or ban.ip = :ip)");
			   $query->execute(array("room"=>$room, "username"=>$user['username'], "ip"=>$ip));
		   }
	   }
	   else{
		   $query = $db->prepare("select * from bans where ip = :ip and room_name = :room");
		   $query->execute(array("ip"=>$ip, "room"=>$room));
	   }
	   if ($query->fetch(PDO::FETCH_ASSOC))
		   return true;
	   else
		   return false;
   }
   function isToxic($ip)
   {
       return false; //temp removed
       $variable = file_get_contents('bannedips.csv');
       //$ip2 = ',' . $ip . ',';
       if (substr_count($variable,$ip))
       {
           return true;
       }
   }
?>
