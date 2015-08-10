# bayms.web
This is the final iteration of the Bay Area Youth Music Society's 2015 user
management system. Its primary goals are to (1) allow people to apply to join
BAYMS, (2) allow members to update their profile and add pieces to events, and
(3) allows admins to admit/reject applicants, manage events, approve/reject
submitted pieces.

## functions
```
/**
 * @license The MIT License
 * @author Kevin Zhang
 * @version v0.1.2
 */
class BAYMS

   /**
    * Retrieves the user with the specified user_name from the users database
    * and verifies the user_pass values. If the user_name and user_pass match,
    * then it sets the local user_id and user_type values and returns true. if
    * login fails, then it returns false.
    */
   public function login($user_name, $user_pass)

   /**
    * Inserts a user with the specified user_name and user_pass values into the
    * database. It does not directly check success/failure - instead, it calls
    * the login function with the specified values and returns the result.
    */
   public function apply($user_name, $user_pass)

   /**
    * Returns a $user_id or throws an Exception, depending on whether the
    * current logged-in user has permission to access the specified user's
    * data. Only admins or the user themselves should have permission.
    */
   private function verifyUserID($user_id)

   /**
    * Returns information about all users in the database. This function is
    * only available for user_type 2 and higher.
    */
   public function getAllUsers()

   /**
    * Returns an array of information about the user specified by $user_id. If
    * the user_id is not specified, the current logged-in user's user_id is
    * used. This function uses the verifyUserID function to handle permissions.
    */
   public function getUser($user_id = false)

   /**
    * Sets the user_type of the specified user to 1 if $admitted is true, or
    * 0 if $admitted is false. If user_type is 0, the user is only an applicant
    * but if user_type is 1, then the user is a member. Only user_type 2 and
    * higher can use this function.
    */
   public function admitUser($user_id, $admitted = true)

   /**
    * Extract relevant fields from the $user array and update the user
    * specified by $user_id from the users table. If the user_id is not
    * specified, the current logged-in user's user_id is used. This function
    * uses the verifyUserID function to handle permissions.
    */
   public function updateUser($user, $user_id = false)

   /**
    * Delete the user specified by $user_id from the users table. If the
    * user_id is not specified, the current logged-in user's user_id is used.
    * This function uses the verifyUserID function to handle permissions.
    */
   public function deleteUser($user_id = false)

   /**
    * Returns information about each event in the events table.
    */
   public function getAllEvents()

   /**
    * Returns information about the event specified by $event_id.
    */
   public function getEvent($event_id)

   /**
    * Inserts a new row into the events table, and then calls the updateEvent
    * function to actually store the values provided by the $event array. Only
    * user_type 2 and higher can use this function.
    */
   public function insertEvent($event)

   /**
    * Extracts relevant values from the $event array and and updates the event
    * with $event_id. Only user_type 2 and higher can use this function.
    */
   public function updateEvent($event, $event_id)

   /**
    * Deletes the the event specified by $event_id. This does not remove pieces
    * linked with this $event_id. Only user_type 2 and higher can use this
    * function.
    */
   public function deleteEvent($event_id)

   /**
    * Returns all pieces associated with the specified $event_id.
    */
   public function getAllPieces($event_id)

   /**
    * Returns the piece with the specified $piece_id.
    */
   public function getPiece($piece_id)

   /**
    * Inserts a new row into the pieces table and calls updatePiece to set the
    * values in the $piece array. Only user_type 1 and higher can use this
    * function.
    */
   public function submitPiece($piece)

   /**
    * Sets the piece_approved value of the piece with the specified $piece_id
    * to 1 or 0, depending on whether $approved is true or false. Only
    * user_type 2 and higher can use this function.
    */
   public function approvePiece($piece_id, $approved = true)

   /**
    * Extract relevant fields from the $piece array and update the piece with
    * the specified $piece_id. Only user_type 2 and higher OR the original
    * submitter of the event can use this function.
    */
   public function updatePiece($piece, $piece_id)

   /**
    * Delete the piece with the specified $piece_id. Only user_type 2 and
    * higher OR the original submitter of the event can use this function.
    */
   public function deletePiece($piece_id)
```

## database
```
CREATE TABLE `users` (
   `user_id` INTEGER PRIMARY KEY AUTOINCREMENT,
   `user_type` INTEGER DEFAULT 0,
   `user_name` TEXT UNIQUE,
   `user_pass` TEXT,
   `student_name` TEXT,
   `student_phone` TEXT,
   `student_email` TEXT,
   `parent_name` TEXT,
   `parent_phone` TEXT,
   `parent_email` TEXT,
   `home_address` TEXT,
   `current_school` TEXT,
   `instrument_1` TEXT,
   `instrument_1_about` TEXT,
   `instrument_2` TEXT,
   `instrument_2_about` TEXT,
   `instrument_3` TEXT,
   `instrument_3_about` TEXT,
   `performance_experience` TEXT,
   `additional_information` TEXT
)
```

```
CREATE TABLE `events` (
   `event_id` INTEGER PRIMARY KEY AUTOINCREMENT,
   `event_date` TEXT,
   `event_time` TEXT,
   `event_location` TEXT,
   `event_recording` TEXT
)
```

```
CREATE TABLE `pieces` (
   `piece_id` INTEGER PRIMARY KEY AUTOINCREMENT,
   `piece_approved` INTEGER DEFAULT 0,
   `user_id` INTEGER,
   `event_id` INTEGER,
   `piece_name` TEXT,
   `piece_composer` TEXT,
   `piece_performer` TEXT,
   `piece_information` TEXT
)
```
