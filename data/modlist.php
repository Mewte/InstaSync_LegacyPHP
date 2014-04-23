<?php
    require dirname(__FILE__). "/../includes/connect.php";
    if (isset($_POST["room"]))
    {
        $db = createDb();
        $output = array();
		$query = $db->prepare("select username from mods where room_name = ?");
		$query->execute(array($_POST['room']));
		$mods = $query->fetchAll(PDO::FETCH_ASSOC);
		array_push($output, $_POST['room']);
		foreach ($mods as $mod){
			array_push($output, $mod['username']);
		}
        echo json_encode($output);
    }
?>
