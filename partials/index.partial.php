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
    mysql_select_db("bibbytube", $connection);
    $title = "InstaSynch - The only #BasedTyrone Approved Internet Forum - Watch videos with 'friends' HAHA FRIENDS HA HA HA";
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
			<div>
				<iframe width="364" height="205" src="//www.youtube.com/embed/uWMONDOgEd4?rel=0" frameborder="0" allowfullscreen></iframe>
				<div style="display: inline-block; width: 335px; float: right; text-align: center; margin-top: 30px;">
					<img src="/images/logoNOBG.png" height="38" width="119"/>
					<h3 style="margin-bottom: 4px;"><a href="https://twitter.com/search?q=%23basedtyrone&src=typd" target="_blank">#BasedTyrone</a> Approved</h3>
					<h3 style="font-weight: bold; text-shadow: 1px 1px rgb(114,114,114);">Since 2014</h3>
				</div>
			</div>			
			<div class="social">
				<span class="media">
					  <a target="_blank" href="http://youtube.com"><img width="32" border="0" height="32" alt="facebook" src="/images/youtube.png"></img></a>                          
				</span>
				<span class="media">
					<a target="_blank" href="http://vimeo.com"><img width="32" border="0" height="32" alt="facebook" src="/images/vimeo.png"></img></a>                            
				</span>
				<span class="media">
					<a target="_blank" href="http://twitch.tv"><img width="32" border="0" height="32" alt="facebook" src="/images/twitch.png"></img></a>                            
				</span>                            
				<span class="media">
					<a target="_blank" href="https://www.facebook.com/instasynch"><img width="32" border="0" height="32" alt="facebook" src="/images/facebook.png"></img></a>
				</span>            
				<span class="media">
					<a target="_blank" href="http://twitter.com/instasynch"><img width="32" border="0" height="32" alt="twitter" src="/images/twitter.png"></img></a>
				</span>  
			</div>
		</div>
		<div class="right">
			<div>
				<a class="twitter-timeline"  href="https://twitter.com/InstaSynch"  data-widget-id="364186530270543872" height="200" width="250">Tweets by @InstaSynch</a>
				<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
			</div>
		</div>
		<div class="left" style="width: 100%;">
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
		</div>
	</div>
	<div class="content-body">
		<?php
			$query = "SELECT *, least(t.users, 10) * rand() as result FROM rooms as t where users > 0 and listing = 'public' and title <> 'No Videos' and (NSFW = 0 or NSFW = 1) order by result desc limit 24";
			$roomlist = mysql_query($query, $connection);
			while ($room = mysql_fetch_array($roomlist, MYSQLI_ASSOC))
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