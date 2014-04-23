
<?php
//actions add, remove
    require(dirname(__FILE__) . "/../includes/connect.php");
    if (isset($_POST["username"], $_POST["room"], $_POST["action"]) && (strtolower($_POST["username"]) != strtolower($_POST["room"])))
    {  
		$db = createDb(true);
        if ($_POST["action"] == "add")
        {
            $username = $_POST["username"];
			$query = $db->prepare("insert into mods (room_name, username, permissions)
									values (:room, :username, :permissions)");
			try{
				if ($query->execute(array("room"=>$_POST['room'], "username"=>$_POST['username'], "permissions"=>1))){
					$output['result'] = true;
				}
				else{
					$output['result'] = false;
					$output['error'] = "Unknown error occured";
					echo 'here';
				}
				echo json_encode($output);
			} catch (Exception $ex) {
				if ($ex->errorInfo[1] == 1062){ //duplicate key
					$output['result'] = false;
					$output['error'] = "That user is already a mod.";
				}
				elseif ($ex->errorInfo[1] == 1452){ //username not found
					$output['result'] = false;
					$output['error'] = "That username was not found.";
				}
				else{
					$output['result'] = false;
					$output['error'] = "Unknown error occured";
				}
				echo json_encode($output);
			}
        }
        elseif ($_POST["action"] == "remove")
        {
            $username = $_POST["username"];
			$query = $db->prepare("delete from mods where username = :username and room_name = :room");
			$query->execute(array("username"=>$username, "room"=>$_POST['room']));
			if ($query->rowCount()){
				$output['result'] = true;
			}
			else{
				$output['result'] = false;
				$output['error'] = "Mod not found.";
			}
			echo json_encode($output);
        }    
    }
?>