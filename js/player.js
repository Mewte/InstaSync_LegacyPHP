/*
    <InstaSynch - Watch Videos with friends.>
    Copyright (C) 2013  InstaSynch
*/
function player(containerID){
	var container = $("#"+containerID);
	var player = this;
	//var triggeredByAPI = true; //all calls are assumed to be triggered by the user unless set to false by API action
	this.video = null;
	this.loadedVideo = null;
	
	var volume = 0.1;
	var muted = false;
	
	this.on = {};
	this.on["userSeeked"] = function(){
		console.log("user seeked");
	};
	this.on["userPlayed"] = function(){
		console.log("user played");
	};
	this.on["userPaused"] = function(){
		console.log("user paused");
	};
	this.on['resynchNeeded'] = function(){
		
	};
	this.trigger = function(event,data){
	};
	var vidContainerShown = false;	
	this.play = function(info, time, playing){
		if (!vidContainerShown){
			container.show();
			vidContainerShown = true;
		}
		//triggeredByAPI = false; //to force a resynch
		switch (info.provider){
			case "youtube":
				loadYoutube(info.id, time, playing);
				break;
			case "vimeo":
				var src = "http://vimeo.instasynch.com/video.php?id="+info.id+"&type=vimeo&redirect=1";
				var destination = "http://vimeo.com/"+info.id;
				loadMP4(src, time, playing, "/images/videojs/icons/vimeo.png",destination);
				break;
			case "dailymotion":
				loadDailymotion(info.id, time, playing);
				break;	
			case "twitch":
				loadTwitch(info.channel);
				break;
		}
		player.loadedVideo = info;
	};
	this.resume = function(){
		if (player.video != null){
			//triggeredByAPI = true;
			player.video.play();
			this.on['resynchNeeded']();
		}
	};
	this.pause = function(){
		if (player.video != null){
			//triggeredByAPI = true;
			player.video.pause();
		}
		
	};
	this.seekTo = function(time){
		console.log(time + 1);
		if (player.video != null){
			//triggeredByAPI = true;
			player.video.currentTime(time + 0.5);//compensate for buffer time
		}
	};
	this.time = function(){
		
	};
	this.destroy = function(){
		removePlayer();
	};
	function loadYoutube(id, time, playing){
		var src = "http://www.youtube.com/watch?v="+id+"";
		if (player.video === null || player.video.mediaType != "youtube"){
			removePlayer();
			createVideoTag("youtube");
			player.video = videojs("youtube", {
					"techOrder": ["youtube"], 
					"src": src,
					"blockClick":isLeader, //temporary
					"forceHTML5":true,
					ytcontrols: showYTcontrols
				}).ready(function(){
					var p = this;
					if (isLeader){ //be sure video.js controls are on if leader
						p.controls(true);
					}
					attachGenericEvents(p);
					this.one('playing', function(){
						p.currentTime(time);
					});
					this.on('play', function(){
						console.log('play');						
					});
					this.on('pause', function(){
						//resynchNeeded = true;
					});
					this.on('playing', function(){
						console.log('playing');
						//todo: add a buffer bool in case were playing after pausing to buffer
						if (p.firstPlay){
							if (muted)
								p.muted(true);
							else
								p.volume(volume);							
							player.on['resynchNeeded'](); //resynch after loading
							p.firstPlay = false;
						}
					});
					this.on('error', function(event){
						//alert('error');
					});
					this.on('loadstart', function(){
						p.trigger('play');
						console.log('load start');
					});
					this.on('timeupdate', function(){
						
					});
					this.on('stalled', function(){
						console.log('stalled');
					});
					this.on('ready', function(){
						p.volume(volume);
					});
					if (playing)
						p.play();
			});
			player.video.logobrand().initialize({
				"image":"/images/videojs/icons/youtube.png",
				"destination":src
			});
			player.video.mediaType = "youtube";
		}
		else{
			player.video.src(src);
			player.video.play();
			player.video.logobrand().loadImage("/images/videojs/icons/youtube.png");
			player.video.logobrand().setDestination(src);
		}
		player.video.firstPlay = true;
	}
	function loadDailymotion(id, time, playing){
		var src = "http://www.dailymotion.com/video/"+id+"";
		if (player.video === null || player.video.mediaType != "dailymotion"){
			removePlayer();
			createVideoTag("dailymotion");
			player.video = videojs("dailymotion", {
					"techOrder": ["dailymotion"], 
					"src": src
				}).ready(function(){
					var p = this;
					attachGenericEvents(p);
					this.one('playing', function(){
						p.currentTime(time);
					});
					this.on('play', function(){});
					this.on('pause', function(){});
					this.on('playing', function(){
						if (p.firstPlay){
							if (muted)
								p.muted(true);
							else
								p.volume(volume);
							player.on['resynchNeeded'](); //resynch after loading
							p.firstPlay = false;
						}
					});
					this.on('error', function(event){});
					this.on('timeupdate', function(){
						
					});
					this.on('ready', function(){
					});
					p.on('userinactive', function(){
						this.trigger('useractive');
					});
					p.bigPlayButton.hide();
					p.controlBar.show();					
					if (playing){
						p.play();
					}
			});
			player.video.logobrand().initialize({
				"image":"/images/videojs/icons/dailymotion.png",
				"destination":src
			});
			player.video.mediaType = "dailymotion";
		}
		else{
			player.video.src(src);
			player.video.play();
			player.video.logobrand().loadImage("/images/videojs/icons/dailymotion.png");
			player.video.logobrand().setDestination(src);
		}
		player.video.firstPlay = true;
	}		
	function loadMP4(src, time, playing, brand, destination){
		if (player.video === null || player.video.mediaType != "mp4"){
			removePlayer();
			createVideoTag("mp4");
			var srcEle = $("<source/>", {
				"src":src,
				"type":"video/mp4"
			});
			$("#mp4").attr("src", src);
			$("#mp4").html(srcEle);
			player.video = videojs("mp4", {
					"techOrder": ["html5","flash"],
					"controls":"true"
				}).ready(function(){
					var p = this;
					attachGenericEvents(p);
					this.one('playing', function(){
						p.currentTime(time);
					});
					this.on('playing', function(){
						if (p.firstPlay){ //resynch after loading
							if (muted)
								p.muted(true);
							else
								p.volume(volume);							
							player.on['resynchNeeded'](); //resynch after loading
							p.firstPlay = false;
						}				
					});
					this.on('pause', function(){
						console.log('paused');						
					});
					this.on('error', function(event){
						//alert('error');
					});
					this.on('loadstart', function(){
						p.trigger('play');
						console.log('load start');
					});
					this.on('timeupdate', function(){
						
					});
					this.on('stalled', function(){
						console.log('stalled');
					});
					if (playing)
						p.play();
			});
			player.video.logobrand().initialize({
				"image": brand,
				"destination":destination
			});
			player.video.mediaType = "vimeo";
		}
		else{
			player.video.src(src);
			player.video.play();
			player.video.poster("");
			player.video.logobrand().loadImage(brand);
			player.video.logobrand().setDestination(destination);
		}
		player.video.firstPlay = true;
	}
	function loadTwitch(channel){
		removePlayer();
        var embed = '<object type="application/x-shockwave-flash" height="320" width="550" id="live_embed_player_flash" data="http://www.twitch.tv/widgets/live_embed_player.swf?channel=' + channel +'" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="allowNetworking" value="all" /><param name="movie" value="http://www.twitch.tv/widgets/live_embed_player.swf" /><param name="flashvars" value="hostname=www.twitch.tv&channel='+channel+'&auto_play=true&start_volume=25" /></object>';
        $(container).html(embed);   
	}
	function createVideoTag(id){
		var video = $("<video/>", {
			"id":id,
			"class":"video-js vjs-default-skin",
			"controls":"",
			"preload":"auto"
		});
		video.attr("width", "550");
		video.attr("height", "320");
		$(container).html(video);
	}
	function removePlayer(){
		if (player.video !== null){
			player.video.dispose();
		}
		$(container).empty();
		player.video = null;
		player.loadedVideo = null;
	}
	function attachGenericEvents(video){
		video.controlBar.progressControl.seekBar.on('userSeeked', function(event){
			var time = (Math.round(event.time));
			player.on["userSeeked"](time);	
		});
		video.on("volumechange", function(){
			if (video.muted()){
				muted = video.muted();				
			}
			else{
				volume = video.volume();
				muted = false;
			}
		});
		video.on("userPlayed", function(){
			player.on["userPlayed"]();
		});
		video.on("userPaused", function(){
			player.on["userPaused"]();
		});
	}
}