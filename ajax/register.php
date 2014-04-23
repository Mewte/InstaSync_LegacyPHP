<?php
    //if(file_get_contents("http://www.winmxunlimited.net/utilities/api/proxy/check.php?ip=".$_SERVER['REMOTE_ADDR']) != "0")
//{
      //$output["error"] = "Proxy/Tor detected!";
      //echo json_encode($output);
     // exit();
//}
?>
<?php
    include dirname(__FILE__) . "/../includes/connect.php";
    if (isset($_POST["username"],$_POST["password"],$_POST["email"]))
    {
		$db = createDb(true);
        $ip = $_SERVER["REMOTE_ADDR"];
        $username = $_POST["username"];
        $password = hashpw($_POST["password"]);   
        $email = $_POST["email"];
        $output = "";
       
        if (preg_match("/^([A-Za-z0-9]|([-_](?![-_]))){5,16}$/", $username))
        {
            if (filter_var($email, FILTER_VALIDATE_EMAIL) == false)
            {
				$output['success'] = false;
                $output["error"] = "Invalid Email Format";
            }
            else
            {
                //check IP limit
                $query = $db->query("select * from ips where ip = '{$ip}'");
				$record = $query->fetch(PDO::FETCH_ASSOC);
                if ($record)
                {
                    $ipcount = $record["count"];
                }
                else
                {
                    $ipcount = 0;
                }
                if ($ipcount <= 5)
                {
					$sessionid = generateSingleToken();
					try{
						$query = $db->prepare("insert into users (username, hashpw, cookie, email)
												VALUES (:username, :hashpw, :cookie, :email)");
						$query->execute(array("username"=>$username, "hashpw"=>$password, "cookie"=>$sessionid, "email"=>$email));
						$query = $db->prepare("insert into rooms (room_id, room_name, description, users, thumbnail, visits, title)
												select id as room_id,
												username as room_name,
												'No Description' as description,
												0 as users,
												'none' as thumbnail,
												0 as visits,
												'No Videos' as title from users
												where username = :username");
						$query->execute(array("username"=>$username));
						$continue = true;
					}
					catch (PDOException $e){
						//error code 23000 is sql error for duplicate entry
						if ($e->errorInfo[0] == 23000){
						}
						$continue = false;
					}
					if ($continue){
						$db->query("insert into ips (ip, count) VALUES ('{$ip}', 1) on duplicate key update count=count+1");
						setcookie("username", $username, time() + (60*60*24*7), "/");
						setcookie("sessionid", $sessionid, time() + (60*60*24*7), "/");
						$output["success"] = true;
					}
					else{
						$output['success'] = false;
						$output['error'] = "Username taken.";						
					}
                }
                else
                {
                    $output["success"] = false;
                    $output["error"] = "Max users registered.";
                }
            }
        }
        else
        {
            $output["success"] = false;
            $output["error"]= "5-16 char, A-Z, 1-9, - _";            
        }
        echo json_encode($output);
    }
?>