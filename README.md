# bayms.web
This is the final iteration of the Bay Area Youth Music Society's 2015 user
management system. Its primary goals are to (1) allow people to apply to join
BAYMS, (2) allow members to update their profile and add pieces to events, and
(3) allows admins to admit/reject applicants, manage events, approve/reject
submitted pieces.

> https://dev.bayms.org

## api calls
The API calls map directly into the BAYMS class. The camelCase function names
are turned into lowercase underscore-separated GET fields ("getAllUsers"
becomes "./api.php?x=get_all_users") and arguments become REQUEST fields.
Optional arguments are reproduced accurately, and the returned value is JSON
encoded before being sent to the client.

## functions
```
class BAYMS
   function login($user_name, $user_pass)
   function apply($user_name, $user_pass)
   function changePassword($new_user_pass)

   function getAllUsers()
   function getUser($user_id = false)
   function admitUser($user_id, $admitted = true)
   function updateUser($user, $user_id = false)
   function deleteUser($user_id = false)

   function getAllEvents()
   function getEvent($event_id)
   function insertEvent($event)
   function updateEvent($event, $event_id)
   function deleteEvent($event_id)

   function getAllPieces($event_id)
   function getPiece($piece_id)
   function submitPiece($piece)
   function orderPiece($piece_id, $piece_order)
   function approvePiece($piece_id, $approved = true)
   function updatePiece($piece, $piece_id)
   function deletePiece($piece_id)
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
   `student_birthday` TEXT,
   `parent_name` TEXT,
   `parent_phone` TEXT,
   `parent_email` TEXT,
   `parent_2_phone` TEXT,
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
);

CREATE TABLE `events` (
   `event_id` INTEGER PRIMARY KEY AUTOINCREMENT,
   `event_date` TEXT,
   `event_time` TEXT,
   `event_location` TEXT,
   `event_recording` TEXT
);

CREATE TABLE `pieces` (
   `piece_id` INTEGER PRIMARY KEY AUTOINCREMENT,
   `piece_order` INTEGER DEFAULT 0,
   `piece_approved` INTEGER DEFAULT 0,
   `user_id` INTEGER,
   `event_id` INTEGER,
   `piece_name` TEXT,
   `piece_composer` TEXT,
   `piece_performer` TEXT,
   `piece_length` TEXT,
   `piece_information` TEXT
);
```
