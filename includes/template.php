<?php
    //if(file_get_contents("http://www.winmxunlimited.net/utilities/api/proxy/check.php?ip=".$_SERVER['REMOTE_ADDR']) != "0")
//{
      //echo "Proxy/Tor detected! If you feel you've reached this message by error, please email admin@instasynch.com";
      //echo "Also, this could just be a temporary error with the IP resolver. Please dont panic and just wait it out :-)";
      //exit();
//}
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
	echo "Domain mismatch.";
	exit();
    }
?>
<?php 
    header('Access-Control-Allow-Origin: *'); 
    $roomname = str_replace("/", "", $_GET["room"]);
	$title = "InstaSynch: " . $roomname."'s room!";
    $description  = "Watch videos with friends!";
?>
<!DOCTYPE html> 
<html>
	<?php include dirname(__FILE__) . "/header.php" ?>
    <body>
        <div class="container">
            <?php include dirname(__FILE__) . "/truetop.php" ?>
			<?php include dirname(__FILE__) . "/adsense.php"; ?>			
			<div id="partialPage">
				<?php include dirname(__FILE__) . "/../partials/room.partial.php"; ?>
			</div>
            <?php include dirname(__FILE__) . "/footer.php" ?>
        </div>
    </body>
</html>