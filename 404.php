<?php
	header("HTTP/1.0 404 Not Found");
	$title = "InstaSynch - Page not found";
    $description = "Page not found.";
?>
<html>
    <?php include "includes/header.php" ?>
    <body>
        <div class="container"> 
            <?php include "includes/truetop.php"; ?>   
			<div id="partialPage">	
				<?php include "partials/404.partial.php"; ?>
			</div>
            <?php include "includes/footer.php"; ?>
        </div>       
    </body>
</html>