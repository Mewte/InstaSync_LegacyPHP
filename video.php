<?php
if (isset($_GET['id'], $_GET['type'])) {
	$id = $_GET['id'];
	$type = $_GET['type'];
	$redirect = isset($_GET['redirect']);
	$quality = null;
	
	$types = array(
		"dailymotion"=>array(
			"location"=>"http://dailymotion.com/embed/video/",
			"referer"=>"dailymotion.com/embed/video"
		),
		"vimeo"=>array(
			"location"=>"http://player.vimeo.com/video/",
			"referer"=>"player.vimeo.com"
	));
	if (!isset($types[$type])){
		header("HTTP/1.0 404 Not Found");
		echo "Not supported.";
		exit();
	}
	$opts = array(
	'http'=>array(
		'method'=>"GET",
		'header'=>"Accept-language: en\r\n" .
		"Cookie: foo=bar\r\n".
		"Referer: {$types[$type]['referer']}\r\n".
		"User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0\r\n"
		)	
	);
	$context = stream_context_create($opts);
	// Open the file using the HTTP headers set above
	$file = @file_get_contents($types[$type]['location'].$id, false, $context);
	if ($file){
		switch ($type){
			case "vimeo":
				parseVimeo($file, $redirect);
				break;
			case "dailymotion":
				parseDailyMotion($file, $redirect);
				break;
		}
	}
	else{
		header("HTTP/1.0 404 Not Found");
		echo "Video not found.";
	}
}
else{
	header("HTTP/1.0 404 Not Found");
	echo "Missing parameters.";
}

function parseVimeo($file, $redirect = false, $quality = "not used yet"){
		$start = strpos($file, "a={") + 3; //get occurance of after a={
		$end = strpos($file, "};", $start); //get the first }; using the $start as an offset
		$length = $end - $start;
		$data = json_decode('{'.substr($file, $start, $length).'}');
		$urls = array();
		$urls['mobile'] = $data->request->files->h264->mobile->url;
		$urls['hd'] = $data->request->files->h264->hd->url;
		$urls['sd'] = $data->request->files->h264->sd->url;
		if ($redirect){
			header("Location: ".$urls['sd']);
		}
		else{
			header('Content-Type: application/json');
			echo json_encode($urls);
		}	
}
function parseDailyMotion($file, $redirect, $quality = "not used yet"){
		$start = strpos($file, "var info = {") + 12; //get occurance of after var info = {
		$end = strpos($file, "}},", $start); //get the first }}; using the $start as an offset
		$length = $end - $start;
		$data = json_decode('{'.substr($file, $start, $length).'}}');
		$urls = array();
		$urls['stream_h264_url'] = get_final_url($data->stream_h264_url);
		//$urls['stream_h264_ld_url'] = $data->stream_h264_ld_url;
		//$urls['stream_h264_hq_url'] = $data->stream_h264_hq_url;
		//$urls['stream_h264_hd_url'] = $data->stream_h264_hd_url;
		//$urls['stream_h264_hd1080_url'] = $data->stream_h264_hd1080_url;
		if ($redirect){
			header("Location: ".$urls['stream_h264_url']);
		}
		else{
			header('Content-Type: application/json');
			echo json_encode($urls);
		}	
}
function get_redirect_url($url){
    $redirect_url = null; 

    $url_parts = @parse_url($url);
    if (!$url_parts) return false;
    if (!isset($url_parts['host'])) return false; //can't process relative URLs
    if (!isset($url_parts['path'])) $url_parts['path'] = '/';

    $sock = fsockopen($url_parts['host'], (isset($url_parts['port']) ? (int)$url_parts['port'] : 80), $errno, $errstr, 30);
    if (!$sock) return false;

    $request = "HEAD " . $url_parts['path'] . (isset($url_parts['query']) ? '?'.$url_parts['query'] : '') . " HTTP/1.1\r\n"; 
    $request .= 'Host: ' . $url_parts['host'] . "\r\n"; 
    $request .= "Connection: Close\r\n\r\n"; 
    fwrite($sock, $request);
    $response = '';
    while(!feof($sock)) $response .= fread($sock, 8192);
    fclose($sock);

    if (preg_match('/^Location: (.+?)$/m', $response, $matches)){
        if ( substr($matches[1], 0, 1) == "/" )
            return $url_parts['scheme'] . "://" . $url_parts['host'] . trim($matches[1]);
        else
            return trim($matches[1]);

    } else {
        return false;
    }

}

/**
 * get_all_redirects()
 * Follows and collects all redirects, in order, for the given URL. 
 *
 * @param string $url
 * @return array
 */
function get_all_redirects($url){
    $redirects = array();
    while ($newurl = get_redirect_url($url)){
        if (in_array($newurl, $redirects)){
            break;
        }
        $redirects[] = $newurl;
        $url = $newurl;
    }
    return $redirects;
}

/**
 * get_final_url()
 * Gets the address that the URL ultimately leads to. 
 * Returns $url itself if it isn't a redirect.
 *
 * @param string $url
 * @return string
 */
function get_final_url($url){
    $redirects = get_all_redirects($url);
    if (count($redirects)>0){
        return array_pop($redirects);
    } else {
        return $url;
    }
}