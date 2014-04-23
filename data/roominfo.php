<?php
    require(dirname(__FILE__) . "/../includes/connect.php");
    if (isset($_POST["room"])) // get specific information about this room
    {
		$db = createDb();
        $query = $db->prepare("select * from rooms where room_name = ?");
		$query->execute(array($_POST['room']));
		$output = array();
        if ($query->fetch(PDO::FETCH_ASSOC))
        {
            //output room info
        }
        else
        {
            $output["error"] = "Room does not exist.";
        }
        echo json_encode($output);
    }
?>
