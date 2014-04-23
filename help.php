<?php
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
        echo "Domain mismatch.";
	exit();
    }	
    require "includes/connect.php";
    mysql_select_db("instasynch", $connection);
    
    $title = "InstaSynch - Help & Information";
    $description = "Variety of helpful information to get you well on your way to enjoying YouTube, Vimeo, and TwitchTV with friends.";
?>
<!DOCTYPE html> 
<html>
	<?php include "includes/header.php" ?>
	<body>
		<div class="container"> 
			<?php include "includes/truetop.php" ?>
			<div id="partialPage">	
				<?php include "partials/help.partial.php"; ?>
			</div> 
			<?php include "includes/footer.php"; ?>
		</div>
	</body>
</html>
<?php
    mysql_close($connection);
?>