<?php
    if(strpos($_SERVER['HTTP_HOST'], "instasynch.com") === false)
    {
        header('HTTP/1.0 404 Not Found');
	echo "Domain mismatch.";
	exit();
    }
?>
<?php 
    header('Access-Control-Allow-Origin: *');
	header("Cache-Control: no-cache");
	header("Pragma: no-cache");
    $roomname = str_replace("/", "", $_GET["room"]);
    $visits = 0;
    $about = "";
    $description  = "";
    $nsfw = 0;
    $listing = "";
    
    require dirname(__FILE__) . "/../includes/connect.php";
    //GET AND INCRIMENT VISITORS
	$db = createDb();
    $query = $db->prepare("select *, user.username as roomname from rooms as room
				JOIN users as user ON room.room_id = user.id 
				where user.username = :roomname");
	$query->execute(array("roomname"=>$roomname));
    $result = $query->fetch(PDO::FETCH_ASSOC);
    if ($result)
    {
        $visits = $result["visits"];
        $visits += 1;
        $description = $result["description"];
        $about = $result["info"];
        $nsfw = $result["NSFW"];
        $listing = $result["listing"];
		$room_id = $result["room_id"]; //for easily updating visits
    }
    else
    {
		header("Location: /404.php");
		exit();
    }
    $query = $db->prepare("UPDATE rooms as room SET visits = :visits 
							WHERE room_id = :room_id");
	$query->execute(array("visits"=>$visits, "room_id"=>$room_id));
    //-----------
?>
<script>
	var ROOMNAME = "<?php echo $roomname; ?>";
	global.page.url = "/rooms/" + ROOMNAME;
	global.page.title = "InstaSynch - " + ROOMNAME + "'s Room";
	global.page.name = "room";
	global.page.room = ROOMNAME;
	//get emotes
	$.ajax({
            type: "GET",
            url: "/emotes/"+ROOMNAME.toLowerCase()+".js",
			error: function()
			{
				$.ajax({
				type: "GET",
				url: "/js/emotes.js",
				dataType: "script",
				cache: true});
			},
            dataType: "script",
            cache: true
    });
</script>
<div style="display: none;" id="cleanUpOnRemoval"></div>
<div id="st-descr">
	<div class="top-descr">
		 <?php echo $roomname;?>'s room  
			<div class="descr-stats">
				  <div class="descr-stat">
					  <div class="descr-stat-value" id="viewercount">?</div>
					  <div class="descr-stat-tip">viewing</div>    
				 </div>
				<div class="descr-stat">
					<div class="descr-stat-value"><?php echo $visits;?></div>
					<div class="descr-stat-tip">visits</div>
				</div>
			</div>
	</div>
</div>
<div id="centerstage">    
	<div id="media-title">
		<div id="vidTitle" class="title"></div>            
	</div>
	<div id="stage">
		<div class="stage"> 
			<div id="media">
				<div class="howTo">
					<ul>
						<li>1. To add videos, copy the video URL and put it in the input box.</li>
						<li>2. To control the player, Use the Take Lead button and use the slider and buttons that appear.</li>
						<li>4. Want to invite others to your room? Copy and paste the URL address in the address bar.</li>
						<li>5 If you'd like to make your room private (It wont appear on the front page) then visit the <a href="/settings/#tabs-2" target="_blank">room settings page</a> and uncheck "Public".</li>
						<li>6. Check out the <a href="/help.php" target="_blank">Help</a> page for more information.</li>
					 </ul>
				</div>
			</div>                                                    
			<div id="chat">        
				<div id="chat_list">

				</div>  
				<div id="chat_users">
					<!-- in the future, make this a list -->
				</div>                           
				<input id="cin" maxlength="240" type="text" disabled="true"/>
				<div id="join-chat" style="display: none;">
					<input id="join" maxlength="16" style="color: black;" class="name placeholder" placeholder="Enter a name">
					<button id="btn-join" class="basic-btn join" tabindex="15">Join</button>
				</div>
				<div id="bio" style="display: none;">
					<div class="username">
						<span></span>
					</div>
					<div class="userinfo">
					</div>
					<div class="avatar">
						<img src=""/>
					</div>
					<button id="mute">Mute</button>
					<button id="unmute">Unmute</button>
					<button id="kick" class="mod">Kick</button>
					<button id="ban" class="mod">Ban</button>
				</div>
				<div id="chat_controls" style="">
					<div class="controls" >
						<div id="gear" class="settings toggle">
							<img height="16" src="/images/gear.png" width="16"/> 
						</div>
					</div>                           
					<div class="content hide"></div>
				</div>                         
			</div>
			<div id="playlist">
				<div class="playlist-controls">
					<div class="leader sliderContainer" style="display: none;">
						<div id="play" class="play-button icon"></div><div id="pause" class="pause-button icon"></div>
						<div id="slider" class="slider" style="padding: 2px 0px 2px 0px; height: 15px; margin: 6px 0px 0px 12px;">
							<div class="info" style="font-size: 10px; float: right;">
								<span id="sliderCurrentTime">0:00</span>
								<span id="sliderDuration">/ 5:00</span>
							</div>
						</div>
					</div>
					<div class="controls noselect">
						<div class="skips" title="Vote to skip video">
							<div id="skip" class="skip-image"></div>
							<div class="counter" title="Total votes / Votes needed">
								<div style="margin-bottom: 3px; font-size: 12px;">
									Skips
								</div>
								<div id="skip-count">
									0/0
								</div>
							</div>
						</div>
						<div class="add-vid" id="addVid">
							<input id="URLinput" title="Add YouTube/Vimeo/Twitch URL" type="text" placeholder="Video URL"/><div id="addUrl" title="Add Video" class="plus"></div>
						</div>
						<div id="toggleplaylistlock" class="playlistlock" title="Playlist lock"></div>
						<div class="settings">
							<div class="open"></div>
							<ul id="playlist-settings-menu" class="menu noselect">
								<li id="resynch" title="Resynchs the video to the correct position">Resynch</li>
								<li id="reload" title="Reloads the video if video failed to load or an error occured.">Reload</li>
								<li title="Enable or disable video autosynch"><label for="autosynch">Autosynch</label><input id="autosynch" type="checkbox" value="Autosynch" checked/></li>
							</ul>
						</div>
						<!-- search
						<div class="search">
							<div class="open"></div>
							<div class="search-box">
								
							</div>
						</div>
						-->
					</div>
				</div>
				<div class="playlist">
					<ul id="videos" class="videos">
						<div id="video-list"></div>
					</ul>
					<script>
						$(document).ready(function()
						{
							$("#videos").jScrollPane({verticalDragMinHeight: "25", mouseWheelSpeed: 31, contentWidth: '0px'});
						});
					</script>
					<div class="overall">
						<div class="total-videos"><span id="total-videos">0</span> videos</div>
						<div class="total-duration"><span id="total-duration">00:00:00</span></div>
					</div>
					<div class="detailed-info" style="display: none;">
						<div class="loading"></div>
						<div class="provider youtube">
							<div id="youtube-title" class="title">Test Movie Title</div>
							<div class="stats">
								<div id="youtube-uploader"></div>
								<div class="views" title="Video Views">
									<div id="youtube-views"></div><div class="view-image image-offset"></div>
								</div>
								<div class="rating" title="Video likes & dislikes">
									<div id="youtube-likes"></div><div class="thumbsup-image image-offset"></div>
									<div id="youtube-dislikes"></div><div class="thumbsdown-image image-offset"></div>									
								</div>
							</div>
							<p id="youtube-description" class="description"></p>
						</div>
						<div class="close"></div>
						<script>
							$(".detailed-info .close").click(function()
							{
								$(".detailed-info").fadeOut();
								$(".detailed-info .provider").hide();
								$(".detailed-info .loading").show();
							});
						</script>
					</div>
				</div>
			</div>
			<div class="poll-container">
				<div class="st-poll" style="display: none;">
					<div class="poll-title"></div>
					<div class="poll-results choices">              

					</div>
					<div class="close-poll x"></div>
				</div> 
				<div>
					<button id="lead" class="mod">Lead Me</button> 
					<button id="unlead" style="display:none;">Unlead</button> 
					<button id="create-pollBtn" onclick="javascript: $('#create-poll').toggle();" class="mod">Create Poll</button>                        
					<div id="create-poll" style="display: none;">
						<input class="formbox" id="title" placeholder="Poll Title"><br />
						<input class="formbox create-poll-option" placeholder="Option"><br />
						<input class="formbox create-poll-option" placeholder="Option"><br />
						<input class="formbox create-poll-option" placeholder="Option"><br />
						<button id="add-option">Add Option</button>
						<button id="submit-poll">Create Poll</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<div id="roomFooter">
	<div class="roomFooter ui-widget-content ui-corner-all">
		<span>
			<strong>About</strong>
		</span>
		<p>
			<?php echo htmlspecialchars($about); ?>
		</p>
	</div>
</div>
<script>
	$(document).ready(function()
	{
		global.loadRoomObj();
	});
</script>