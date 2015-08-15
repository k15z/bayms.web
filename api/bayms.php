<?php
/**
 * @license The MIT License
 * @author Kevin Zhang
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
    * Accepts an id_token and uses Google's API to verify that it is valid. If
    * valid, then the appropriate user_id and user_type values are set.
    */
   public function googleLogin($google_token) {
      $json = @file_get_contents("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=$google_token");
      $json = json_decode($json, true);
      if (!$json || !isset($json['sub']))
         return false;

      $user_google_id = $json['sub'];
      $stmt = $this->db->prepare("
         SELECT * FROM users WHERE
            user_google_id = :user_google_id
      ");
      $stmt->bindValue(':user_google_id', $user_google_id);

      $login = $stmt->execute();
      $login = $login->fetchArray(SQLITE3_ASSOC);
      if ($login) {
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
   public function googleApply($google_token) {
      $json = @file_get_contents("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=$google_token");
      $json = json_decode($json, true);
      if (!$json || !isset($json['sub']))
         return false;

      $user_google_id = $json['sub'];
      $stmt = $this->db->prepare("
         INSERT INTO users
            (user_name, user_google_id)
         VALUES
            (:user_name, :user_google_id)
      ");
      $stmt->bindValue(':user_name', str_replace('@gmail.com', '', $json['email']));
      $stmt->bindValue(':user_google_id', $user_google_id);

      $apply = $stmt->execute();
      return $this->googleLogin($google_token);
   }

   /**
    * Updates the currently logged-in user with the specified new_user_pass
    * value. Returns true/false on failure - note that you WILL need to
    * reauthenticate using the new password after calling this function.
    */
   public function changePassword($new_user_pass) {
      $stmt = $this->db->prepare("
         UPDATE users SET
            user_pass = :user_pass
         WHERE
            user_id = :user_id
      ");
      $stmt->bindValue(':user_id', $this->user_id);
      $stmt->bindValue(':user_pass', password_hash($new_user_pass, PASSWORD_DEFAULT));

      $update = $stmt->execute();
      return (bool)$update;
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
    * Sets the user_type of the specified user to 1 if $admitted is true, or
    * 0 if $admitted is false. If user_type is 0, the user is only an applicant
    * but if user_type is 1, then the user is a member. Only user_type 2 and
    * higher can use this function.
    */
   public function admitUser($user_id, $admitted = true) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $admitted = $admitted ? 1 : 0;
      $stmt = $this->db->prepare("
         UPDATE users SET
            user_type = $admitted
         WHERE
            user_id = :user_id
      ");
      $stmt->bindValue(':user_id', $user_id);
      $update = $stmt->execute();
      return (bool)$update;
   }

   /**
    * Sets the user_type of the specified user to 2 if $admin is true, or
    * 1 if $admin is false. If user_type is 1, the user is only an member
    * but if user_type is 0, then the user is a admin. Only user_type 2 and
    * higher can use this function.
    */
   public function adminUser($user_id, $admin = true) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $admin = $admin ? 2 : 1;
      $stmt = $this->db->prepare("
         UPDATE users SET
            user_type = $admin
         WHERE
            user_id = :user_id
      ");
      $stmt->bindValue(':user_id', $user_id);
      $update = $stmt->execute();
      return (bool)$update;
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
         "student_name", "student_phone", "student_email", "student_birthday",
         "parent_name", "parent_phone", "parent_email", "parent_2_phone",
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

      $update = $stmt->execute();
      return (bool)$update;
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

   /**
    * Returns information about each event in the events table.
    */
   public function getAllEvents() {
      $stmt = $this->db->prepare("
         SELECT * FROM events
         ORDER BY date(event_date)
      ");
      $result = array();
      $events = $stmt->execute();
      while ($event = $events->fetchArray(SQLITE3_ASSOC)) {
         $event['pieces'] = $this->getAllPieces($event['event_id']);
         $result[] = $event;
      }
      return $result;
   }

   /**
    * Returns information about the event specified by $event_id.
    */
   public function getEvent($event_id) {
      $stmt = $this->db->prepare("
         SELECT * FROM events WHERE
            event_id = :event_id
      ");
      $stmt->bindValue(':event_id', $event_id);
      $event = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
      $event['pieces'] = $this->getAllPieces($event['event_id']);
      return $event;
   }

   /**
    * Inserts a new row into the events table, and then calls the updateEvent
    * function to actually store the values provided by the $event array. Only
    * user_type 2 and higher can use this function.
    */
   public function insertEvent($event) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $stmt = $this->db->prepare("
         INSERT INTO events DEFAULT VALUES
      ");
      $insert = $stmt->execute();
      if ($insert) {
         $event_id = $this->db->lastInsertRowID();
         return $this->updateEvent($event, $event_id);
      }
      return false;
   }

   /**
    * Extracts relevant values from the $event array and and updates the event
    * with $event_id. Only user_type 2 and higher can use this function.
    */
   public function updateEvent($event, $event_id) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $relevant = [
         "event_date", "event_time", "event_location", "event_recording"
      ];
      $found = false;
      $partial = "";
      foreach($event as $key => $value) {
         if (in_array($key, $relevant)) {
            $found = true;
            $partial .= $key . ' = :' . $key . ', ';
         }
         if ($key == "event_date")
            $event[$key] = date_format(date_create($value), "Y-m-d");
      }
      $partial = rtrim($partial, ', ');
      if (!$found)
         return true;

      $stmt = $this->db->prepare("
         UPDATE events SET
            $partial
         WHERE
            event_id = :event_id
      ");
      $stmt->bindValue(':event_id', $event_id);
      foreach($event as $key => $value)
         if (in_array($key, $relevant))
            $stmt->bindValue(':' . $key, $value);

      $update = $stmt->execute();
      return (bool)$update;
   }

   /**
    * Deletes the the event specified by $event_id. This does not remove pieces
    * linked with this $event_id. Only user_type 2 and higher can use this
    * function.
    */
   public function deleteEvent($event_id) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $stmt = $this->db->prepare("
         DELETE FROM events WHERE
            event_id = :event_id
      ");
      $stmt->bindValue(':event_id', $event_id);
      $delete = $stmt->execute();
      return (bool)$delete;
   }

   /**
    * Returns all pieces associated with the specified $event_id.
    */
   public function getAllPieces($event_id) {
      $stmt = $this->db->prepare("
         SELECT * FROM pieces WHERE
            event_id = :event_id
         ORDER BY piece_order
      ");
      $stmt->bindValue(':event_id', $event_id);
      $result = array();
      $pieces = $stmt->execute();
      while ($piece = $pieces->fetchArray(SQLITE3_ASSOC))
         $result[] = $piece;
      return $result;
   }

   /**
    * Returns the piece with the specified $piece_id.
    */
   public function getPiece($piece_id) {
      $stmt = $this->db->prepare("
         SELECT * FROM pieces WHERE
            piece_id = :piece_id
      ");
      $stmt->bindValue(':piece_id', $piece_id);
      $piece = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
      return $piece;
   }

   /**
    * Inserts a new row into the pieces table and calls updatePiece to set the
    * values in the $piece array. Only user_type 1 and higher can use this
    * function.
    */
   public function submitPiece($piece) {
      if ($this->user_type < 1)
         throw new Exception('Permission denied.');

      $stmt = $this->db->prepare("
         INSERT INTO pieces (user_id) VALUES (:user_id)
      ");
      $stmt->bindValue(':user_id', $this->user_id);
      $insert = $stmt->execute();
      if ($insert) {
         $piece_id = $this->db->lastInsertRowID();
         return $this->updatePiece($piece, $piece_id);
      }
      return false;
   }

   /**
    * Sets the piece_order value of the piece with the specified $piece_id
    * to the specified $piece_order. Only user_type 2 and higher can use
    * this function.
    */
   public function orderPiece($piece_id, $piece_order) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $stmt = $this->db->prepare("
         UPDATE pieces SET
            piece_order = :piece_order
         WHERE
            piece_id = :piece_id
      ");
      $stmt->bindValue(':piece_id', $piece_id);
      $stmt->bindValue(':piece_order', $piece_order);
      $update = $stmt->execute();
      return (bool)$update;
   }

   /**
    * Sets the piece_approved value of the piece with the specified $piece_id
    * to 1 or 0, depending on whether $approved is true or false. Only
    * user_type 2 and higher can use this function.
    */
   public function approvePiece($piece_id, $approved = true) {
      if ($this->user_type < 2)
         throw new Exception('Permission denied.');

      $approved = $approved ? 1 : 0;
      $stmt = $this->db->prepare("
         UPDATE pieces SET
            piece_approved = $approved
         WHERE
            piece_id = :piece_id
      ");
      $stmt->bindValue(':piece_id', $piece_id);
      $update = $stmt->execute();
      return (bool)$update;
   }

   /**
    * Extract relevant fields from the $piece array and update the piece with
    * the specified $piece_id. Only user_type 2 and higher OR the original
    * submitter of the event can use this function.
    */
   public function updatePiece($piece, $piece_id) {
      if ($this->user_type < 1)
         throw new Exception('Permission denied.');

      $relevant = [
         "event_id", "piece_name", "piece_composer",
         "piece_performer", "piece_length", "piece_information"
      ];
      $found = false;
      $partial = "";
      foreach($piece as $key => $value) {
         if (in_array($key, $relevant)) {
            $found = true;
            $partial .= $key . ' = :' . $key . ', ';
         }
      }
      $partial = rtrim($partial, ', ');
      if (!$found)
         return true;

      $stmt = $this->db->prepare("
         UPDATE pieces SET
            $partial
         WHERE
            piece_id = :piece_id
            AND (user_id = :user_id OR :user_type > 2)
      ");
      $stmt->bindValue(':piece_id', $piece_id);
      $stmt->bindValue(':user_id', $this->user_id);
      $stmt->bindValue(':user_type', $this->user_type, SQLITE3_INTEGER);
      foreach($piece as $key => $value)
         if (in_array($key, $relevant))
            $stmt->bindValue(':' . $key, $value);

      $update = $stmt->execute();
      return (bool)$update;
   }

   /**
    * Delete the piece with the specified $piece_id. Only user_type 2 and
    * higher OR the original submitter of the event can use this function.
    */
   public function deletePiece($piece_id) {
      if ($this->user_type < 1)
         throw new Exception('Permission denied.');

      $stmt = $this->db->prepare("
         DELETE FROM pieces WHERE
            piece_id = :piece_id
            AND (user_id = :user_id OR :user_type > 2)
      ");
      $stmt->bindValue(':piece_id', $piece_id);
      $stmt->bindValue(':user_id', $this->user_id);
      $stmt->bindValue(':user_type', $this->user_type, SQLITE3_INTEGER);
      $delete = $stmt->execute();
      return (bool)$delete;
   }
}
?>
