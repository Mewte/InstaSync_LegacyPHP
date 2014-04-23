<?php
    require dirname(__FILE__) . "/../includes/connect.php";
    require dirname(__FILE__) . "/../includes/email.php";
    if (isset($_POST["email"], $_POST["username"]))
    {
        $db = createDb();
        $username = $_POST["username"]; 
        $email = $_POST["email"];
		$query = $db->query("select * from resets where time > " . (time() - 60*60) . " and ip = '{$_SERVER["REMOTE_ADDR"]}'");
		if (count($query->fetchAll(PDO::FETCH_ASSOC)) > 3){
			$output["error"] = "Max reset request already used. Please try again later.";
		}
		else{
                $token = generateDoubleToken();
                $time = time();
				$query = $db->prepare("insert into resets (token, user_id, time, ip) "
						. " select :token as token, id, :time as time, :ip as ip from users "
						. " where username = :username and email = :email");
				$query->execute(array(
					"token"=>$token,
					"username"=>$username,
					"email"=>$email,
					"time"=>$time,
					"ip"=>$_SERVER["REMOTE_ADDR"]
				));
				if ($query->rowCount())
				{
					email($email, "DoNotReply@instasynch.com", "", "InstaSynch Password Recovery", "Please click the link below to reset your InstaSynch account password for {$username}: http://instasynch.com/settings/reset.php?token={$token}");
					$output["error"] = "An email with a reset link has been sent. If you don't recieve an email shortly, check your spam folder. Also whitelist 'DoNotReply@instasynch.com'.";
									
				}
				else{
					$output["error"] = "Username and email do not match."; 
				}
		}
        echo json_encode($output);
    }
?>