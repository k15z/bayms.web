# bayms.web
This is the final iteration of the Bay Area Youth Music Society's 2015 user
management system. Its primary goals are to (1) allow people to apply to join
BAYMS, (2) allow members to update their profile and add pieces to events, and
(3) allows admins to admit/reject applicants, manage events, approve/reject
submitted pieces.

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
   `user_id` INTEGER,
   `event_id` INTEGER,
   `piece_name` TEXT,
   `piece_composer` TEXT,
   `piece_performer` TEXT,
   `piece_information` TEXT
)
```
