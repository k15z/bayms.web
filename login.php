<?php

    ini_set("display_errors",1);
    ini_set("display_startup_errors",1);
    error_reporting(-1);
//print 'checkpoint 1';
session_start();
//print 'checkpoint 2';
    require('zeus/zeus.php');
    $z = new Zeus();
//print 'checkpoint 3';
   if (isset($_GET['user_name'])) {
       $_SESSION["user_name"]=$_GET['user_name'];
      if ($z->login($_GET['user_name'], $_GET['user_password'])) {
          header('Location: https://dev.bayms.org/zeus/users/blair/profile.htm');
      } else {
          echo 'login failed';
      }
   } else if (isset($_SESSION["user_name"])&&isset($_GET['user_password'])&&isset($_GET['new_password']))
   {
       if ($z->login($_SESSION["user_name"],$_GET['user_password']))
        {
            if ($_GET['new_password']==$_GET['new_password_2'])
            {
                 $z->changePassword($_GET['new_password_2']);
                 header('Location: https://dev.bayms.org/zeus/users/blair/profile.htm');
            } else {
                echo 'Passwords dont match';   
            }
        } else {
            echo 'Password Incorrect';
        }
   } else {
     echo 'nope';  
   }
?>