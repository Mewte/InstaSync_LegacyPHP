    <head>
        <!-- Source files are generated dynamically so they make look messy when viewing the source in a browser !-->
        <!-- Use http://jsbeautifier.org/ to make the code look pretty again (Or use browser inspector!) !-->
        <title><?php echo $title; ?></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="description" content="<?php echo $description; ?>"/>
        <meta name="keywords" content="YouTube with friends, videos with friends, watch videos with friends, watch stuff with friends, synchtube, synchtube replacement, synchtube clone, synched videos, video chat room"/>
        <meta property="og:image" content="http://instasynch.com/images/fbprofilepic200x200.gif"/>
		<meta property="og:site_name" content="InstaSynch"/>
		<meta property="og:title" content="I couldn't pay my cable bill so now I watch internet videos with strangers instead."/>
		<meta property="og:description" content="Watch videos with friends! (Or make new ones because I only vaguely remember you from high school)"/>
        <meta property="og:url" content="http://instasynch.com"/>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link REL="SHORTCUT ICON" HREF="/favicon.ico">		
		<!-- styles -->
			<link type="text/css" href="/styles/style.css" rel="stylesheet">
			<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
			<link rel="stylesheet" href="/js/videojs/video-js/video-js.css">
		<!-- libraries -->
			<script type="text/javascript" src="/js/socket.io.js"></script>
			<script type="text/javascript" src="/js/jquery-1.9.1.min.js"></script>
			<script type="text/javascript" src="/js/jquery.cookie.js"></script>
			<script type='text/javascript' src="/js/jquery.linkify.js"></script>
			<script type='text/javascript' src="/js/jquery-ui.js"></script>
			<script type='text/javascript' src="/js/videojs/video-js/video.js.php"></script>
				<!-- Video.js plugins -->
				<script type='text/javascript' src="/js/videojs/plugins/videojs.logobrand.js"></script>
				<script src="/js/videojs/plugins/videojs.progressTips.min.js"></script>
					<link rel="stylesheet" href="/js/videojs/plugins/videojs.progressTips.min.css" type="text/css" />				
				<script type='text/javascript' src="/js/videojs/plugins/youtube.js"></script>
				<script type='text/javascript' src="/js/videojs/plugins/media.dailymotion.js"></script>
			<script type="text/javascript" src="/js/perfect-scrollbar-0.4.8.with-mousewheel.min.js"></script>
			<script type="text/javascript" src="/js/jquery.jscrollpane.min.js"></script>
			<script type="text/javascript" src="/js/jquery.mousewheel.js"></script>
			<script type="text/javascript" src="/js/mediarates.js"></script>
		<!-- Site Wide -->
			<script type="text/javascript" src="/js/request.js"></script>
		<!-- Room Specific -->
			<script type="text/javascript" src="/js/core.js"></script>
			<script type='text/javascript' src='/js/player.js'></script>
		<!-- Friends List -->
			<script type="text/javascript" src="/js/friends.js"></script>
        <?php
//            if (file_exists("c:/wamp/www/emotes/" . $roomname . ".js"))
//            {
//                echo '<script type="text/javascript" src="/emotes/' . $roomname . '.js"></script>';
//            }
//            else
//            {
//                echo '<script type="text/javascript" src="/js/emotes.js"></script>';
//            }
        ?>		
    </head>