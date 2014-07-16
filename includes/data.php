<?php
	/*
	 * Put all database interactions in this class. Turn this object into whatever is loaded.
	 * By putting all our data objects in here, we can reuse code and make changes without tracking every specific spot that has that code.
	 * $db is expected to be a connected mysql pdo object
	 */
	require_once  dirname(__FILE__) . '/connect.php';
	class instasynch_data{
		private $db;
		private $mc;
		private $data = array();
		public function __construct($db, $mc = null){
			$this->db = $db;
			$this->mc = $mc;
		}
		public function getData(){
			return $this->data;
		}
		public function load($object, $parameters = null){
			if (method_exists($this, "load".$object)){
				$method = 'load'.$object;
				return $this->$method($parameters);
			}
			else{
				return false;
			}
		}
		private function loadRoomlist($parameters){
			if ($this->mc){ //if memcache driver installed
				$this->data = $this->mc->get("front_page_listing");
				if ($this->data == null){
					$this->data = Queries::front_page_room_listing($this->db);
					$this->mc->set("front_page_listing", $this->data, 10);
				}
			}
			else{ //no memcache support (i.e. dev server)
				$this->data = Queries::front_page_room_listing($this->db);
			}
			return true;
		}
		private function loadOnlineCount($parameters){ //Load total users online and total rooms
			if ($this->mc){ //if memcache driver installed
				$this->data = $this->mc->get("online_count");
				if ($this->data == null){
					$this->data = Queries::online_count($this->db);
					$this->mc->set("online_count", $this->data, 10);
				}
			}
			else{ //no memcache support (i.e. dev server)
				$this->data = Queries::online_count($this->db);
			}
			return true;			
		}
	}
	/*
	 * Just a static class of reusable queries
	 * Todo: Make these queries as modular as possible with passable arguments?
	 * Also TODO: add error handling?
	 */
	class Queries{
		static function front_page_room_listing($db){
			$sql = "SELECT room.*, user.username as roomname, least(room.users, 30) * rand() as result FROM rooms as room 
						JOIN users as user ON room.room_id = user.id
						where users > 0 
						and listing = 'public' and title <> 'No Videos' and (NSFW = 0 or NSFW = 1)
						order by result desc limit 24";
			$query = $db->query($sql);
			return $query->fetchAll(PDO::FETCH_ASSOC);	
		}
		static function online_count($db){
			$sql = "select sum(users) as users, rooms.sum as rooms from rooms
					join (select count(*) as sum from rooms where users > 0) as rooms";
			$query = $db->query($sql);
			return $query->fetch(PDO::FETCH_ASSOC);				
		}
	}