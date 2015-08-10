<?php
error_reporting(-1);
ini_set("display_errors",1);
ini_set("display_startup_errors",1);
if ($ng = json_decode(file_get_contents('php://input'), true))
   $_REQUEST = array_merge($_REQUEST, $ng);

if (!isset($_REQUEST['x']))
   die('error: x_not_set');
$x = $_REQUEST['x'];
require('bayms.php');
$bayms = new BAYMS();

switch ($x) {
   case 'login':
      $login = $bayms->login($_REQUEST['user_name'], $_REQUEST['user_password']);
      break;

   case 'apply':
      $apply = $bayms->apply($_REQUEST['user_name'], $_REQUEST['user_password']);
      break;
}
?>
