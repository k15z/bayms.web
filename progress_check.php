<?php
   // Display Errors for Debugging
   ini_set("display_errors",1);
   ini_set("display_startup_errors",1);
   error_reporting(-1);

   print("Checking Database File\n" . "<br/>");
   $db = new SQLite3('hercules.db');
   if ($db) {
      print("Database Opened!\n" . "<br/>");
      $db->close();
   } else {
      print("ERROR! Database Failed to Open!\n" . "<br/>");
   }

   print("Loading Hercules Object\n" . "<br/>");
   require_once("hercules.php");

   print("Generating Random User/Pass\n" . "<br/>");
   $user_name = substr(md5(rand()), 0, 7);
   $user_password = substr(md5(rand()), 0, 7);

   print("Creating New Hercules Object\n" . "<br/>");
   $hercules = new Hercules();

   print("Registering New User\n" . "<br/>");
   $register = $hercules->register($user_name, $user_password);

   if ($register) {
      print("Yay! Registration Successful!\n" . "<br/>");
   } else {
      print("ERROR! Registration Failed!\n" . "<br/>");
   }

   print("Updating User Profile\n" . "<br/>");
   $student_name = "myname";
   $student_email = "noneofyourbusiness";
   $update = $hercules->update($student_name, $student_email);

   if ($update) {
      print("Yay! Update Probably Successful!\n" . "<br/>");
   } else {
      print("ERROR! Update Failed!\n" . "<br/>");
   }

   print("Checking Login\n" . "<br/>");
   $login = $hercules->login($user_name, $user_password);
   if (!$login) {
      print("ERROR! Login failed!\n" . "<br/>");
   } else {
      print("Yay! Login was Successful!\n" . "<br/>");
   }

   print("Double Checking Update Results\n" . "<br/>");
   if ($login["student_name"] != $student_name) {
      print("ERROR! Student name was not saved!\n" . "<br/>");
   }
   else if ($login["student_email"] != $student_email) {
      print("ERROR! Student email was not saved!\n" . "<br/>");
   }
   else {
      print("Yay! Update was Successful!\n" . "<br/>");
   }
?>
