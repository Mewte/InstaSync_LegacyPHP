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
    mysql_select_db("bibbytube", $connection);
    //GET AND INCRIMENT VISITORS
    $roomname = mysql_real_escape_string($roomname);
    $query = "select * from rooms where roomname = '{$roomname}'";
    $resource = mysql_query($query);
    if ($row = mysql_fetch_array($resource, MYSQLI_ASSOC))
    {
        $visits = $row["visits"];
        $visits += 1;
        $description = $row["description"];
        $about = $row["info"];
        $nsfw = $row["NSFW"];
        $listing = $row["listing"];
    }
    else
    {
		header("Location: /404.php");
		exit();
    }
	
    $query = "UPDATE rooms SET visits = '{$visits}' WHERE rooms . roomname = '{$roomname}'";
    mysql_query($query, $connection);
    mysql_close($connection);
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
            url: "/emotes/"+ROOMNAME+".js",
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
			<div id="playlist" style="overflow: visible;">
				<div class="playlist">
					<div id="playlistcontrols">
						<div class="sliderContainer leader" style="display: none;">  
							<div id="play" class="basic-button">PLAY</div><div id="pause" class="basic-button">PAUSE</div>
							<div id="slider" class="slider">
								<div class="info" style="font-size: 10px; float: right;">
									<span id="sliderCurrentTime">0:00</span>
									<span id="sliderDuration">/ 5:00</span>
								</div>
							</div>
						</div>
						<div class="basic-btn-btnbar" id="playlistactions">
							<div id="skip" class="basic-button">Skip Video</div>
							<div id="skipCounter">0/0</div>
							<div id="addVid" style="visibility: hidden; position: relative; left: 10px;">
								<input name="URLinput" id="URLinput" type="text" disabled/>
								<div style="margin-left: 5px; margin-right: 10px; position: relative;" id="addUrl" class="basic-button" >Add Vid</div>
							</div>   
							<div id="resynch" class="basic-button">Resynch</div>
							<div id="reload" class="basic-button">Reload</div>                                    
							<div id="toggleplaylistlock"><img src="/images/lock.png"/></div>                                    
						</div>
						<div id="playlist_items">
								 <ul id="ulPlay" class="items ui-sortable pllist">              

								 </ul>
						</div>
						<div id="playlist_total">
							<span class="total-videos">0 videos</span>
							<span style="position: relative; left: 10px;" class="total-duration"> 00:00</span>
						</div>
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