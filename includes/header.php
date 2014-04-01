    <head>
        <!-- Source files are generated dynamically so they make look messy when viewing the source in a browser !-->
        <!-- Use http://jsbeautifier.org/ to make the code look pretty again (Or use browser inspector!) !-->
        <title><?php echo $title; ?></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="description" content="<?php echo $description; ?>"/>
        <meta name="keywords" content="YouTube with friends, videos with friends, watch videos with friends, watch stuff with friends, synchtube, synchtube replacement, synchtube clone, synched videos, video chat room"/>
        <meta property="og:image" content="http://instasynch.com/images/fbcoverphoto.gif"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link REL="SHORTCUT ICON" HREF="/favicon.ico">		
		<!-- styles -->
			<link type="text/css" href="/styles/style.css" rel="stylesheet">
			<link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
		<!-- libraries -->
			<script type="text/javascript" src="/js/socket.io.js"></script>
			<script type="text/javascript" src="/js/jquery-1.9.1.min.js"></script>
			<script type="text/javascript" src="/js/jquery.cookie.js"></script>
			<script type='text/javascript' src="/js/jquery.linkify.js"></script>
			<script type="text/javascript" src="/js/froogaloop.min.js"></script>
			<script type='text/javascript' src='/js/tubeplayer.js'></script>
			<script src="/js/jquery-ui.js"></script>
			<script type="text/javascript" src="/js/perfect-scrollbar-0.4.8.with-mousewheel.min.js"></script>
			<script type="text/javascript" src="/js/jquery.jscrollpane.min.js"></script>
			<script type="text/javascript" src="/js/jquery.mousewheel.js"></script>
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