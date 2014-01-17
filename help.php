<?php
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
        echo "Domain mismatch.";
	exit();
    }	
    require "includes/connect.php";
    mysql_select_db("bibbytube", $connection);
    
    $title = "InstaSynch - Help & Information";
    $description = "Variety of helpful information to get you well on your way to enjoying YouTube, Vimeo, and TwitchTV with friends.";
?>
<!DOCTYPE html> 
<html>
    <?php include "includes/header.php" ?>
    <body> 
        <div class="container"> 
            <?php include "includes/truetop.php" ?>   
            <?php //include $_SERVER["DOCUMENT_ROOT"]."advertise/includes/banner.php" ?>
            <div class="help-content">
                <div class="help-body">
                    <h1>Help</h1>
                    <ul>
                        <li><a href="#leader">Leader Mode</a></li>
                        <li><a href="#polls">Polls</a></li>
                        <li><a href="#moderators">Moderators</a></li>
                        <li><a href="#muting">Muting Users</a></li>
                        <li><a href="#commands">Useful Commands</a></li>
                        <li><a href="#common">Common Issues</a></li>
                    </ul>
                    <h2 id="leader">Leader Mode</h2>
                    <p>
                        Any moderator can control the player. To control the player click the "Lead Me" button below the chat. A scrollbar with
                        two buttons, Resume and Pause, will appear. To seek to specific portion of the video, click and drag to the desired time.
                    </p>
                    <h2 id="polls">Polls</h2>
                    <p>
                        All moderators can create polls. To create a poll click the "Create Poll" button and fill out the options. Only registered users can vote on polls.
                    </p>
                   <h2 id="moderators">Moderators</h2>
                    <p>
                        Moderators are created by the room owner to moderate the room. Moderators can do a variety of task including
                        banning/kicking users, modifying the playlist. To create moderators, type 'mod followed by the username you wish to mod.
                        i.e. 'mod Mewte. To remove a mod type 'demod followed by the username you wish to demod. To view all mods in a room, use 
                        the command 'modlist.
                    </p>
                </div>
            </div>
            <?php include "includes/footer.php"; ?>
        </div>      
    </body>
</html>
<?php
    mysql_close($connection);
?>