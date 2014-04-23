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
?>
<script>
	global.page.url = "/404.php";
	global.page.title = "InstaSynch - Page not found.";
	global.page.name = "404";
</script>
<div class="index-content">
	<div class="content-header">
		<div style="text-align: center; font-size: 34px; padding: 8px; color:rgb(74,74,74); text-shadow: 1px 1px rgba(34,34,34,0.3);">
			Error 404
		</div>
		<div style="text-align: center; padding: 8px; color:rgb(34,34,34);">
			I'm sorry, I couldn't find the page you were looking for, but check out some of the public rooms below!
		</div>
	</div>
	<div class="content-body">
		<?php
			$query = $db->query("SELECT room.*, user.username as roomname, least(room.users, 10) * rand() as result FROM rooms as room 
						JOIN users as user ON room.room_id = user.id 
						where users > 0 
						and listing = 'public' and title <> 'No Videos' and (NSFW = 0 or NSFW = 1)
						order by result desc limit 6");
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