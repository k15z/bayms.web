<?php
/**
 * @license The MIT License
 * @author Kevin Zhang
 * @version v0.1.2
 */
class BAYMS {
   private $db = false;
   private $user_id = false;
   private $user_type = false;

   /**
    * Connects to the bayms.db SQLite database file. Be careful when dealing
    * with relative file paths.
    */
   function __construct() {
      $this->db = new SQLite3("./bayms.db");
      if (!$this->db)
         throw new Exception('Database connection failed.');
   }

   /**
    * Retrieves the user with the specified user_name from the users database
    * and verifies the user_pass values. If the user_name and user_pass match,
    * then it sets the local user_id and user_type values and returns true. if
    * login fails, then it returns false.
    */
   public function login($user_name, $user_pass) {
      $stmt = $this->db->prepare("
         SELECT * FROM users WHERE
            user_name = :user_name
      ");
      $stmt->bindValue(':user_name', strtolower($user_name));

      $login = $stmt->execute();
      $login = $login->fetchArray(SQLITE3_ASSOC);
      if ((bool)password_verify($user_pass, $login['user_pass'])) {
         $this->user_id = $login['user_id'];
         $this->user_type = $login['user_type'];
         return true;
      }
      return false;
   }

   /**
    * Inserts a user with the specified user_name and user_pass values into the
    * database. It does not directly check success/failure - instead, it calls
    * the login function with the specified values and returns the result.
    */
   public function apply($user_name, $user_pass) {
      $stmt = $this->db->prepare("
         INSERT INTO users
            (user_name, user_pass)
         VALUES
            (:user_name, :user_pass)
      ");
      $stmt->bindValue(':user_name', strtolower($user_name));
      $stmt->bindValue(':user_pass', password_hash($user_pass, PASSWORD_DEFAULT));

      $apply = $stmt->execute();
      return $this->login($user_name, $user_pass);
   }

   /**
    * Returns a $user_id or throws an Exception, depending on whether the
    * current logged-in user has permission to access the specified user's
    * data. Only admins or the user themselves should have permission.
    */
   private function verifyUserID($user_id) {
      if (!$user_id || $this->user_id == $user_id)
         $user_id  = $this->user_id;
      else if ($user_id && $this->user_type < 2)
         throw new Exception('Permission denied.');
      return $user_id;
   }

   /**
    * Returns information about all users in the database. This function is
    * only available for user_type 2 and higher.
    */
   public function getAllUsers() {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $stmt = $this->db->prepare("
         SELECT * FROM users
      ");
      $result = array();
      $users = $stmt->execute();
      while ($user = $users->fetchArray(SQLITE3_ASSOC))
         $result[] = $user;
      return $result;
   }
   /**
    * Returns an array of information about the user specified by $user_id. If
    * the user_id is not specified, the current logged-in user's user_id is
    * used. This function uses the verifyUserID function to handle permissions.
    */
   public function getUser($user_id = false) {
      $user_id = $this->verifyUserID($user_id);
      $stmt = $this->db->prepare("
         SELECT * FROM users WHERE
            user_id = :user_id
      ");
      $stmt->bindValue(':user_id', $user_id);
      $user = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
      return $user;
   }

   /**
    * Extract relevant fields from the $user array and update the user
    * specified by $user_id from the users table. If the user_id is not
    * specified, the current logged-in user's user_id is used. This function
    * uses the verifyUserID function to handle permissions.
    */
   public function updateUser($user, $user_id = false) {
      $user_id = $this->verifyUserID($user_id);

      $relevant = [
         "user_pass",
         "student_name", "student_phone", "student_email",
         "parent_name", "parent_phone", "parent_email",
         "home_address", "current_school",
         "instrument_1", "instrument_1_about",
         "instrument_2", "instrument_2_about",
         "instrument_3", "instrument_3_about",
         "performance_experience",
         "additional_information"
      ];
      $found = false;
      $partial = "";
      foreach($user as $key => $value) {
         if ($key == "user_pass")
            $user["user_pass"] = password_hash($user_pass, PASSWORD_DEFAULT);
         if (in_array($key, $relevant)) {
            $found = true;
            $partial .= $key . ' = :' . $key . ', ';
         }
      }
      $partial = rtrim($partial, ', ');
      if (!$found)
         return true;

      $stmt = $this->db->prepare("
         UPDATE users SET
            $partial
         WHERE
            user_id = :user_id
      ");
      $stmt->bindValue(':user_id', $this->user_id);
      foreach($user as $key => $value)
         if (in_array($key, $relevant))
            $stmt->bindValue(':' . $key, $value);

      $user = $stmt->execute();
      return (bool)$user;
   }

   /**
    * Delete the user specified by $user_id from the users table. If the
    * user_id is not specified, the current logged-in user's user_id is used.
    * This function uses the verifyUserID function to handle permissions.
    */
   public function deleteUser($user_id = false) {
      $user_id = $this->verifyUserID($user_id);
      $stmt = $this->db->prepare("
         DELETE FROM users WHERE
            user_id = :user_id
      ");
      $stmt->bindValue(':user_id', $user_id);
      $delete = $stmt->execute();
      return (bool)$delete;
   }

}
?>
