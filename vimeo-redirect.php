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
	if (isset($_GET['version']) && $_GET['version'] == "2"){
		$start = strpos($file, "a={") + 3; //get occurance of after a={
		$end = strpos($file, "};", $start); //get the first }; using the $start as an offset
		$length = $end - $start;
		$data = json_decode('{'.substr($file, $start, $length).'}');
		$urls = array();
		$urls['mobile'] = $data->request->files->h264->mobile->url;
		$urls['hd'] = $data->request->files->h264->hd->url;
		$urls['sd'] = $data->request->files->h264->sd->url;
		header('Content-Type: application/json');
		echo json_encode($urls);
	}
	else{
		echo $file;
	}	
}