<?php
    require dirname(__FILE__) . "/../includes/connect.php";
    $output = "";
    $output["success"] = false; //just assume all outputs are false unless I set true
    if (isset($_POST["current"], $_POST["newpass"]))
    {
            if (isset($_COOKIE["username"], $_COOKIE["sessionid"]))
            {
                mysql_select_db("bibbytube", $connection);
                $output = "";
                $username = mysql_real_escape_string($_COOKIE["username"]);
                $sessionid = mysql_real_escape_string($_COOKIE["sessionid"]);        
				$current = hashpw($_POST["current"]);
                $new = hashpw($_POST["newpass"]);                
                $query = "update users set hashpw = '". $new ."' where username = '{$username}' and cookie = '{$sessionid}' and hashpw = '". $current ."' limit 1";

                mysql_query($query);
                if (mysql_affected_rows() === 1)
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