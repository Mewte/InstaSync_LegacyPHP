<?php
    define("SERVER_ADD", "127.0.0.1");
    define("SERVER_USER", "root");
    define("SERVER_PASS", "");
    
	set_error_handler(function($errno, $errstr, $errfile, $errline, $errcontext){
		//echo $errstr;
		//return true;
		return false;
	});
	register_shutdown_function(function(){
		$error = error_get_last();
		if ($error['type'] == 1) {
			header( "HTTP/1.1 500 I... failed.. you...'", true, 500 );
			echo "i made a srs error D: plz dnt tell any1 ok? dnt let mewte reformat me again i will b bttr next time.......";
		} 
	});
    function createDb($enableErrors = false)
    {
		//Todo: Create a throw 503 function for when database is down
		try{
			$db = new PDO('mysql:host='.SERVER_ADD.';dbname=instasynch;charset=utf8', SERVER_USER, SERVER_PASS, array(PDO::ATTR_TIMEOUT => "8"));
		}
		catch (Exception $e){
			header( "HTTP/1.1 503 Service Unavailable", true, 503 );
			header( "Retry-After: 300" );
			echo "Unable to connect to database. Try again later.";
			exit();
		}
		if ($enableErrors)
			$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //development
		else
			$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT); //production
        return $db;
    }
	function createMc(){
		if (function_exists("memcache_connect")){
			$memcached = new Memcached;
			$memcached->addServer('127.0.0.1', 11211);
			return $memcached;
		}
		return false;
	}
    function generateSingleToken() //40 characters
    {
        return sha1(mt_rand() . 'sl' . crypt(uniqid(true)) . microtime(true));
    }
    function generateDoubleToken() //73 characters
    {
        return md5(base_convert(mt_rand(), 10, mt_rand(20,36))) . "_" . generateSingleToken();
    }
    function randomPassword()
    {
        return base_convert(mt_rand(),10, mt_rand(20,36));
    }
    function hashpw($pass)
    {
        return sha1($pass);
    }
    function hashpw2($pass)
    {
        return $pass;
        //return hashpw($pass);
    }
?>