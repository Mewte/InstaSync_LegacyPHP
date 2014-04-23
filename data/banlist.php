<?php
    require dirname(__FILE__) . '/../includes/connect.php';
    if (isset($_POST["room"]))
    {
        $db = createDb();
        $output = array();
		
        $query = $db->prepare("select username, loggedin from bans where room_name = :room");
		$query->execute(array("room"=>$_POST['room']));
		$bans = $query->fetchAll(PDO::FETCH_ASSOC);
        foreach ($bans as $ban)
        {
			array_push($output, array("username"=>$ban['username'], "loggedin"=>$ban['loggedin']));
        }
        echo json_encode($output);
    }
?>
