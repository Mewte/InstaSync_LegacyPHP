<?php
    require dirname(__FILE__) . "/../includes/connect.php";
    $output = "";
    $output["success"] = false; //just assume all outputs are false unless I set true
    if (isset($_POST["current"], $_POST["newpass"]))
    {
            if (isset($_COOKIE["username"], $_COOKIE["sessionid"]))
            {
                $output = "";
				$db = createDb();
                $username = $_COOKIE["username"];
                $sessionid = $_COOKIE["sessionid"];        
				$current = hashpw($_POST["current"]);
                $new = hashpw($_POST["newpass"]);     
				
				$query = $db->prepare("
						update users set hashpw = :new where username = :username and cookie = :cookie and hashpw = :current limit 1
					");
				$query->execute(array("new"=>$new, "username"=>$username, "cookie"=>$sessionid, "current"=>$current));
                if ($query->rowCount() === 1)
                {
                    $output["error"] = "Changes successfully made to: {$username}.";
                    $output["success"] = true;
                }
                else
                {
                    $output["error"] = "Error changing password.";
                    $output["success"] = false;                    
                }   
            }
    }
    echo json_encode($output);
?>