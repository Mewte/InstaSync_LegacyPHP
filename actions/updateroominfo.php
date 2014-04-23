<?php
    require(dirname(__FILE__) . "/../includes/connect.php");
    if (isset($_POST["users"], $_POST["thumbnail"], $_POST["title"], $_POST["roomname"]))
    {
        $title = $_POST["title"];
		$db = createDb();
		$query = $db->prepare("update rooms set users = :users, thumbnail = :thumbnail, title = :title where room_name = :room");
		$query->execute(array("users"=>$_POST['users'], "thumbnail"=>$_POST['thumbnail'], "title"=>$_POST['title'], "room"=>$_POST['roomname']));                      
    }
?>
