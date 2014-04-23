<?php
    include dirname(__FILE__) . "/../includes/connect.php";
    if (!isset($_GET["token"]))
    {
        header('HTTP/1.0 404 Not Found');
        echo "No Token!";
        exit();
    }
?>
<!DOCTYPE html> 
<html>
    <head>
        <title>InstaSynch - Account Settings</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="description" content=""/>
        <meta name="keywords" content="YouTube, SynchTube, watch, videos, friends, Social, bibbytube, bibby tube, babby, babbytube, bibby, InstaSynch"/>
        <META http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link type="text/css" href="/styles/style.css" rel="stylesheet">     
        <link REL="SHORTCUT ICON" HREF="/favicon.ico">   
        <script type="text/javascript" src="/js/jquery-1.9.1.min.js"></script>
        <script type="text/javascript" src="/js/jquery.cookie.js"></script>      
        <script type="text/javascript" src="/js/request.js"></script>  
        <script src="/js/jquery-ui.js"></script>  
        <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
        <?php include(dirname(__FILE__) . "/../includes/analytics.php"); ?>
    </head>
    <body>   
        <div class="container"> 
            <?php require dirname(__FILE__) . "/../includes/truetop.php"; ?>
            <div>
                <div class="ui-widget-content ui-corner-all" style="height: 130px; width: 720px; margin: 50px auto 0px auto">
                    <p style="padding: 5px;">
                        <?php
							$db = createDb();
                            $token = $_GET["token"];
							$query = $db->prepare("select * from resets where token = :token");
							$query->execute(array("token"=>$token));
                            if ($result = $query->fetch(PDO::FETCH_ASSOC))
                            {
                                if ($result["time"] > (time() - 60*60*3)) //three hour expiration
                                {
                                    $randomPass = randomPassword();
									$query = $db->prepare("update users set hashpw = :hashpw where id = :user_id limit 1");
									if ($query->execute(array("hashpw"=>hashpw($randomPass), "user_id"=>$result["user_id"]))){
										echo "This accounts password has been changed to: <strong>{$randomPass}</strong><br />";
										echo "You may log in and change your password in the account settings page.<br />";
										echo "As you will need this password again to change your password, it is recomended you copy and paste it into the correct field.<br />";
										echo "For security reasons, the username is not displayed. The username can be found in the email that brought you here.";										
									}
									else{
										echo "Database failure. Try again.";
									}
                                }
                                else 
                                {
                                    echo "This token is either not valid or has expired.";
                                }
                                $query = $db->prepare("delete from resets where token = :token limit 1");
								$query->execute(array("token"=>$token));
                            }
                            else
                            {
                                echo "This token is either not valid or has expired.";
                            }
                        ?>
                    </p>
                </div>
            </div>
            <?php include "../includes/footer.php"; ?>    
        </div>
    </body>
</html>