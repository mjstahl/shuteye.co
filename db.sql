PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE shuteye (
host_id VARCHAR(40),
attendee_id VARCHAR(40),
session_id VARCHAR(40),
password TEXT,
sessions_left TINYINT,
PRIMARY KEY (host_id));
COMMIT;
