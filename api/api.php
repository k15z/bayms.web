<?php
// Print errors for debugging
ini_set("display_errors",1);
ini_set("display_startup_errors",1);
error_reporting(-1);

// Hacky way of supporting AngularJS
if ($ng = json_decode(file_get_contents('php://input'), true))
   $_REQUEST = array_merge($_REQUEST, $ng);

// Find `x` request parameter
if (!isset($_REQUEST['x']))
   die('error: x_not_set');
$x = $_REQUEST['x'];

// Create BAYMS object
require('bayms.php');
$bayms = new BAYMS();

// Login if possible
if (isset($_REQUEST['user_name']) && $_REQUEST['user_pass'])
   $bayms->login($_REQUEST['user_name'], $_REQUEST['user_pass']);
else if (isset($_REQUEST['google_token']))
   $bayms->googleLogin($_REQUEST['google_token']);

// Expose non-user functions
switch ($x) {
   case 'login':
      $result = $bayms->login($_REQUEST['user_name'], $_REQUEST['user_pass']);
      die(json_encode($result));

   case 'apply':
      $result = $bayms->apply($_REQUEST['user_name'], $_REQUEST['user_pass']);
      die(json_encode($result));

   case 'google_login':
      $result = $bayms->googleLogin($_REQUEST['google_token']);
      die(json_encode($result));

   case 'google_apply':
      $result = $bayms->googleApply($_REQUEST['google_token']);
      die(json_encode($result));

   case 'get_all_events':
      $result = $bayms->getAllEvents();
      die(json_encode($result));

   case 'get_event':
      $result = $bayms->getEvent($_REQUEST['event_id']);
      die(json_encode($result));

   case 'get_all_pieces':
      $result = $bayms->getAllPieces($_REQUEST['event_id']);
      die(json_encode($result));

   case 'get_piece':
      $result = $bayms->getPiece($_REQUEST['piece_id']);
      die(json_encode($result));
   
   case 'get_news':
      $result = $bayms->getNews();
      die(json_encode($result));
}

// Must login now.
$result = false;
if (isset($_REQUEST['user_name']) && $_REQUEST['user_pass'])
   $result = $bayms->login($_REQUEST['user_name'], $_REQUEST['user_pass']);
else if (isset($_REQUEST['google_token']))
   $result = $bayms->googleLogin($_REQUEST['google_token']);
if (!$result)
   die("error: login_failed");

// Expose user functions
switch ($x) {
   case 'change_password':
      $result = $bayms->changePassword($_REQUEST['new_user_pass']);
      die(json_encode($result));

   case 'get_all_users':
      $result = $bayms->getAllUsers();
      die(json_encode($result));

   case 'get_all_carpools':
      $result = $bayms->getAllCarpools();
      die(json_encode($result));

   case 'get_user':
      $_REQUEST['user_id'] = isset($_REQUEST['user_id']) ? $_REQUEST['user_id'] : false;
      $result = $bayms->getUser($_REQUEST['user_id']);
      die(json_encode($result));

   case 'admit_user':
      $_REQUEST['admitted'] = isset($_REQUEST['admitted']) ? $_REQUEST['admitted'] : true;
      $_REQUEST['admitted'] = filter_var($_REQUEST['admitted'], FILTER_VALIDATE_BOOLEAN);
      $result = $bayms->admitUser($_REQUEST['user_id'], $_REQUEST['admitted']);
      die(json_encode($result));

   case 'admin_user':
      $_REQUEST['admin'] = isset($_REQUEST['admin']) ? $_REQUEST['admin'] : true;
      $_REQUEST['admin'] = filter_var($_REQUEST['admin'], FILTER_VALIDATE_BOOLEAN);
      $result = $bayms->adminUser($_REQUEST['user_id'], $_REQUEST['admin']);
      die(json_encode($result));

   case 'update_user':
      $_REQUEST['user_id'] = isset($_REQUEST['user_id']) ? $_REQUEST['user_id'] : false;
      $result = $bayms->updateUser($_REQUEST, $_REQUEST['user_id']);
      die(json_encode($result));

   case 'delete_user':
      $_REQUEST['user_id'] = isset($_REQUEST['user_id']) ? $_REQUEST['user_id'] : false;
      $result = $bayms->deleteUser($_REQUEST['user_id']);
      die(json_encode($result));

   case 'insert_event':
      $result = $bayms->insertEvent($_REQUEST);
      die(json_encode($result));

   case 'update_event':
      $result = $bayms->updateEvent($_REQUEST, $_REQUEST['event_id']);
      die(json_encode($result));

   case 'delete_event':
      $result = $bayms->deleteEvent($_REQUEST['event_id']);
      die(json_encode($result));

   case 'clone_event':
      $result = $bayms->cloneEvent($_REQUEST['source_event'], $_REQUEST['target_event']);
      die(json_encode($result));

   case 'submit_piece':
      $result = $bayms->submitPiece($_REQUEST);
      die(json_encode($result));

   case 'order_piece':
      $result = $bayms->orderPiece($_REQUEST['piece_id'], $_REQUEST['piece_order']);
      die(json_encode($result));

   case 'order_pieces': 
	  $result = $bayms->orderPieces($_REQUEST['piece_orders']);
	  die(json_encode($result));
      
   case 'approve_piece':
      $_REQUEST['approved'] = isset($_REQUEST['approved']) ? $_REQUEST['approved'] : true;
      $_REQUEST['approved'] = filter_var($_REQUEST['approved'], FILTER_VALIDATE_BOOLEAN);
      $result = $bayms->approvePiece($_REQUEST['piece_id'], $_REQUEST['approved']);
      die(json_encode($result));

   case 'update_piece':
      $result = $bayms->updatePiece($_REQUEST, $_REQUEST['piece_id']);
      die(json_encode($result));

   case 'delete_piece':
      $result = $bayms->deletePiece($_REQUEST['piece_id']);
      die(json_encode($result));

   case 'insert_news':
      $result = $bayms->insertNews($_REQUEST);
      die(json_encode($result));

   case 'update_news':
      $result = $bayms->updateNews($_REQUEST, $_REQUEST['news_id']);
      die(json_encode($result));

   case 'delete_news':
      $result = $bayms->deleteNews($_REQUEST['news_id']);
      die(json_encode($result));
}

?>
