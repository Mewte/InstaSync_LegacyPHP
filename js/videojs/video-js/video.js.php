<?php
	header('Content-Type: application/javascript');
	header( 'Cache-Control: max-age=86400' );
	if (file_exists("video.instasynch.min.js")){
		ob_clean();
		flush();
		readfile("video.instasynch.min.js");
	}
	else{
		ob_clean();
		flush();
		readfile("video.instasynch.js");
	}
?>