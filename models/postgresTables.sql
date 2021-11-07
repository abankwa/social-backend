-- PERSON TABLE
create table Person (
    userId SERIAL PRIMARY KEY NOT NULL,
    firstName varchar(50),
    lastName varchar(50),
    email varchar(50) NOT NULL,
    userPassword varchar(255)
);
-- POST TABLE
create table Post (
    postId SERIAL PRIMARY KEY NOT NULL,
    postText VARCHAR(255),
    mediaURL varchar(100),
    postDate TIMESTAMP DEFAULT NOW(),
    personId int REFERENCES Person(userId)
) 
-- FRIEND TABLE
CREATE TABLE Friend (
    userid int NOT NULL REFERENCES Person(userId),
    friendId int NOT NULL REFERENCES Person(userId),
    CONSTRAINT user_friend_id PRIMARY KEY (userid, friendid)
);
-- FRIEND REQUEST TABLE
CREATE TABLE FriendRequest (
    requesterid int NOT NULL REFERENCES Person(userId),
    receiverid int NOT NULL REFERENCES Person(userId),
    requestdate TIMESTAMP DEFAULT NOW(),
    CONSTRAINT requester_receiver_id PRIMARY KEY (userid, friendid)
)




--==================
--STORED PROCEDURES
--===================

-- INSERT_FRIEND. PREVENTS DUPLICATE REVERSE ENTRY INTO COMPOSITE TABLE
CREATE OR REPLACE PROCEDURE insert_friend(var1 int, var2 int)
LANGUAGE  SQL
AS $$
INSERT INTO friend(userid,friendid)  SELECT LEAST(var1,var2), GREATEST(var1,var2)
$$

