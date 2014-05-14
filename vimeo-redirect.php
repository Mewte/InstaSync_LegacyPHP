<?php
//session_start();

/**
  Setp 1. Get the query string variable and set it in a session, then remove it from the URL.
*/
if (isset($_GET['id'], $_GET['autoplay']) && !isset($_SESSION['to'])) {
	
	$opts = array(
  'http'=>array(
    'method'=>"GET",
    'header'=>"Accept-language: en\r\n" .
              "Cookie: foo=bar\r\n".
			  "Referer: player.vimeo.com\r\n".
			  "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0\r\n"
  )	
);

	$context = stream_context_create($opts);

	// Open the file using the HTTP headers set above
	$file = file_get_contents("http://player.vimeo.com/video/".$_GET['id']."?api=1&video_id=vimeo&autoplay=1", false, $context);
	echo $file;
	exit();
	
    $_SESSION['to'] = "http://player.vimeo.com/video/".$_GET['id']."?api=1&video_id=vimeo&autoplay=".$_GET['autoplay'];
    header('Location: http://ilikecars.com/vimeo-redirect.php');// Must be THIS script
    exit();
}
/**
  Step 2. The page has now been reloaded, replacing the original referer with  what ever this script is called.
  Make sure the session variable is set and the query string has been removed, then redirect to the intended location.
*/
if (!isset($_GET['to']) && isset($_SESSION['to'])) {
    $output = '<!DOCTYPE html>
<html>
<head>
<meta name="robots" content="none">
<title>Referral Mask</title>
</head>
<body>
<h3>Redirecting...</h3>
<script>window.location.href="'.$_SESSION['to'].'"</script>
<a href="'.$_SESSION['to'].'">Here is your link</a>
</body>
</html>' . "\n";
    unset($_SESSION['to']);
    echo $output;
    exit();
}
?>