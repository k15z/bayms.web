<?
$db = false;
$db = new SQLite3("./api/bayms.db");
//if (!$this->db)
//  throw new Exception('Database connection failed.');
$img=$_FILES['img'];
$user_id=$_POST['user_id'];
if(isset($_POST['submit'])){ 
 if($img['name']==''){  
  echo "<h2>An Image Please.</h2>";
 }else{
  $filename = $img['tmp_name'];
  $client_id="60b5b1baa9f89af";
  $handle = fopen($filename, "r");
  $data = fread($handle, filesize($filename));
  $pvars   = array('image' => base64_encode($data));
  $timeout = 30;
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, 'https://api.imgur.com/3/image.json');
  curl_setopt($curl, CURLOPT_TIMEOUT, $timeout);
  curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Client-ID ' . $client_id));
  curl_setopt($curl, CURLOPT_POST, 1);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_POSTFIELDS, $pvars);
  $out = curl_exec($curl);
  curl_close ($curl);
  $pms = json_decode($out,true);
  $url=$pms['data']['link'];
  if($url!=""){
    //echo $url;
      $db->exec("
         UPDATE users SET
            picture_link='$url'
         WHERE
            student_name='$user_id'
      ");
      header( "Location: index.htm" );
  }else{
   echo "<h2>There's a Problem</h2>";
   echo $pms['data']['error'];  
  } 
 }
}
?>