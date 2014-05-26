<?php
//actions add, remove, purge
	header('Content-Type: application/json');
    require(dirname(__FILE__) . "/../includes/connect.php");
    if (isset($_POST["username"], $_POST["ip"], $_POST["room"], $_POST["action"]))
    {   
		$db = createDb(true);
        if ($_POST["action"] == "add")
        {
            $username = $_POST["username"];
			if ($_POST['loggedin'] == 'true'){ //okay php is terrible... apparently 'false' == true
				$query = $db->prepare("insert into bans (user_id, username, room_name, ip, loggedin)
										select id as user_id, username, :room as room_name, :ip as ip, 1 as loggedin from users where username = :username");
				try{
					if ($query->execute(array("room"=>$_POST['room'], "username"=>$username, "ip"=>$_POST['ip'])) && $query->rowCount()){
						$output['result'] = true;
					}
					else{
						$output['result'] = false;
						$output['error'] = "Error banning user";					
					}
				} catch (Exception $ex) {
					if ($ex->errorInfo[1] == 1062){
						$output['error'] = "User already banned.";
					}
					else{
						$output['error'] = "Error banning user";
					}					
					$output['result'] = false;
				}
			}
			else{
				$query = $db->prepare("insert into bans (user_id, username, room_name, ip, loggedin)
										values (NULL, :username, :room, :ip, 0)");
				try{
					if ($query->execute(array("room"=>$_POST['room'], "username"=>$username, "ip"=>$_POST['ip'])) && $query->rowCount()){
						$output['result'] = true;
					}
					else{
						$output['result'] = false;
						$output['error'] = "Error banning user";
					}
				} catch (Exception $ex) {
					if ($ex->errorInfo[1] == 1062){
						$output['error'] = "User already banned.";
					}
					else{
						$output['error'] = "Error banning user";
					}
					$output['result'] = false;
				}
			}
        }
        elseif ($_POST["action"] == "remove")
        {
            $username = $_POST["username"]; //username is provided by user, not nodejs
			$query = $db->prepare("delete from bans where username = :username and room_name = :room");
			try{
				if ($query->execute(array("room"=>$_POST['room'], "username"=>$username)) && $query->rowCount()){
					$output['result'] = true;
				}
				else{
					$output['result'] = false;
					$output['error'] = "Username not found.";						
				}
			} catch (Exception $ex) {
				$output['result'] = false;
				$output['error'] = "Error removing ban.";
			}
        }
        elseif ($_POST["action"] == "purge")
        {
			$query = $db->prepare("delete from bans where room_name = :room");
			if ($query->execute(array("room"=>$_POST['room']))){
				$output['result'] = true;
			}
			else{
				$output['result'] = false;
				$output['error'] = "Failed to clear the ban list.";
			}
        }
		echo json_encode($output);
    } 
?>
