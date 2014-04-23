<?php
    require dirname(__FILE__) . "/../includes/connect.php";
    if (isset($_POST["username"], $_POST["password"])) //check if trying to login
    {
		$db = createDb();
		$output = "";
        $username = $_POST["username"];
        $password = sha1($_POST["password"]);        
		
        $query = $db->prepare("select * from users where username = :username and hashpw = :pw limit 1");
		$query->execute(array("username"=>$username, "pw"=>$password));
		$result = $query->fetch(PDO::FETCH_ASSOC);
        if ($result)//correct login credentials
        {
            $sessionid = generateSingleToken();
			
			$query = $db->prepare("update users set cookie = :sessionid where username = :username limit 1");
			$query->execute(array("sessionid"=>$sessionid, "username"=>$username));
			
            setcookie("username", $username, time() + (60*60*24*7), "/");
            setcookie("sessionid", $sessionid, time() + (60*60*24*7), "/");            
            $output["success"] = true;
            $output["username"] = $username;
        }
        else //invalid username or password
        {
            $output["success"] = false; 
            $output["error"] = "Invalid userame or password.";
            $output["username"] = "";
        }
        echo json_encode($output);
    }
?>
