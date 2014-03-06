<?php
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
        echo "Domain mismatch.";
		exit();
    }
    $title = "InstaSynch - Watch videos with friends!";
    $description = "Watch synchronized videos with friends and strangers!";
?>
<!DOCTYPE html> 
<html>
    <?php include "includes/header.php" ?>
    <body> 
        <div class="container"> 
            <?php include "includes/truetop.php"; ?>
			<?php include "includes/adsense.php"; ?>
			<div id="partialPage">	
				<?php include "partials/index.partial.php"; ?>
			</div>
            <?php include "includes/footer.php"; ?>
        </div>       
    </body>
</html>