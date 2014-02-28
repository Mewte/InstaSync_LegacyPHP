<?php
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
        echo "Domain mismatch.";
		exit();
    }
    $title = "InstaSynch - Settings";
    $description = "Customize your InstaSynch user account settings.";
?>
<!DOCTYPE html> 
<html>
	<?php include "../includes/header.php" ?>
    <body>   
        <div class="container"> 
            <?php require dirname(__FILE__) . "/../includes/truetop.php" ?>
			<div id="partialPage">	
				<?php include "../partials/settings.partial.php"; ?>
			</div>
            <?php include dirname(__FILE__) . "/../includes/footer.php"; ?>    
        </div>
    </body>
</html>