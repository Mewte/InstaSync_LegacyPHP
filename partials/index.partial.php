<?php
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
        echo "Domain mismatch.";
		exit();
    }
	header("Cache-Control: no-cache");
	header("Pragma: no-cache");
	
    require  dirname(__FILE__) . '/../includes/connect.php';
	$db = createDb();
    $title = "InstaSynch - Watch videos with friends!";
    $description = "Watch synchronized videos with friends and strangers!";
?>
<script>
	global.page.url = "/";
	global.page.title = "<?php echo $title ?>";
	global.page.name = "index";
</script>
<div class="index-content">
	<div class="content-header">
		<div class="left">
			<h1>What is InstaSynch?</h1>
			<p>
			InstaSynch (Inspired by SynchTube) is a place that allows users to watch synchronized videos with each other and chat in real time, fully synchronized!
			</p>
			<h1>Awesome! But how do I get started?</h1>
			<p>
				Simply visit any room you'd like and you can begin chatting as an unregistered user. 
				If you'd like to have all the features (adding videos, voting, friends list, and profile) you must register.
			</p>
			<h1>
				What about my own room?
			</h1>
			<p>
				When you register, you also create a room in your name. To access this room,
				log in and click My Room from the settings drop down menu (accessed by clicking on your name in the top right corner.)
			</p>
			<h1>But I need more help than that!</h1>
			<p>
				Check out the <a href="help.php" onclick='global.requestPartialPage("help"); return false;'>Help</a> page!<br />
				Questions/Comments? Email me at: admin@instasynch.com
			</p>
	<div class="social">                        
		<span class="media" style="font-size: 11px; width: 85px; padding-top: 10px;">
			Supported Media: 
		</span>		
		<span class="media">
			  <a target="_blank" href="http://youtube.com"><img width="32" border="0" height="32" alt="youtube" src="/images/youtube.png"></img></a>                          
		</span>
		<span class="media">
			<a target="_blank" href="http://vimeo.com"><img width="32" border="0" height="32" alt="vimeo" src="/images/vimeo.png"></img></a>                            
		</span>
		<span class="media">
			<a target="_blank" href="http://dailymotion.com"><img width="32" border="0" height="32" alt="dailymotion" src="/images/dailymotion.png"></img></a>                            
		</span>		
		<span class="media">
			<a target="_blank" href="http://twitch.tv"><img width="32" border="0" height="32" alt="twitch" src="/images/twitch.png"></img></a>                            
		</span>	
	</div>				
		</div>
		<div class="right">
			<div>
				<a class="twitter-timeline"  href="https://twitter.com/InstaSynch"  data-widget-id="364186530270543872" height="200" width="250">Tweets by @InstaSynch</a>
				<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
			</div>
		</div>
	</div>
	<div class="content-body">
		<?php
			$query = $db->query("SELECT room.*, user.username as roomname, least(room.users, 10) * rand() as result FROM rooms as room 
						JOIN users as user ON room.room_id = user.id 
						where users > 0 
						and listing = 'public' and title <> 'No Videos' and (NSFW = 0 or NSFW = 1)
						order by result desc limit 24");
			$roomlist = $query->fetchAll(PDO::FETCH_ASSOC);
			foreach ($roomlist as $room)
			{
				echo "<div class='room'>";
					echo "<div class='left'>";
						echo "<a href='/rooms/{$room["roomname"]}' onclick='global.requestPartialPage(\"room\", \"{$room["roomname"]}\"); return false;'>";
							echo "<img width='120px' height='90px' src='{$room["thumbnail"]}'></img>";
						echo "</a>";
						echo "<div class='title'>".htmlspecialchars($room["title"])."</div>";
						echo "<div class='viewers'>{$room["users"]} Viewing</div>";
					echo "</div>";
					echo "<div class='right'>";
						echo "<div class='name'><a href='/rooms/{$room["roomname"]}' onclick='global.requestPartialPage(\"room\", \"{$room["roomname"]}\"); return false;'>{$room["roomname"]}</a></div>";
						echo "<p class='about'>". htmlspecialchars($room["description"]) . "</p>";
					echo "</div>";
				echo "</div>";  
				echo PHP_EOL;
			}
		?>
	</div>
</div>