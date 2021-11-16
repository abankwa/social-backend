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
-- FRIEND TABLE - Junction
CREATE TABLE Friend (
    userid int NOT NULL REFERENCES Person(userId),
    friendId int NOT NULL REFERENCES Person(userId),
    CONSTRAINT user_friend_id PRIMARY KEY (userid, friendid)
);
-- FRIEND REQUEST TABLE - Junction
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





-- MESSENGER
--==========

-- conversation
CREATE TABLE conversation (
    conversationid SERIAL PRIMARY KEY NOT NULL,
    conversationdate TIMESTAMP DEFAULT NOW(),
    title varchar(255) -- use the party_b's name as the title
)

-- conversation2
CREATE TABLE conversation (
    conversationid SERIAL PRIMARY KEY NOT NULL,
    conversationdate TIMESTAMP DEFAULT NOW(),
    user_a_id int NOT NULL REFERENCES Person(userid),
    user_b_id int NOT NULL REFERENCES Person(userid),
    title  varchar(255) -- use the party_b's name as the title
)

-- chat_participants -- Junction
CREATE TABLE conversation_participant(
    conversationid int NOT NULL REFERENCES Conversation(conversationid),
    participantid int NOT NULL REFERENCES Person(userid),
    CONSTRAINT conversation_participant_id PRIMARY KEY (conversationid, participantid)
)

--message
CREATE TABLE Chatmessage(
    messageid SERIAL PRIMARY KEY NOT NULL,
    messagedate TIMESTAMP DEFAULT NOW(),
    senderid int NOT NULL REFERENCES Person(userid),
    conversationid int NOT NULL REFERENCES Conversation(conversationid),
    messagetext varchar(255) 

)

--reactions
CREATE TABLE chatreactions(
    chatreactionId SERIAL PRIMARY KEY NOT NULL,
    reactiontype  VARCHAR(255) NOT NULL,
    messageid int NOT NULL REFERENCES Chatmessage(messageid) --message will contain ownerid
)

--replies
CREATE TABLE messagereply (
    replyid SERIAL PRIMARY KEY NOT NULL,
    messageid INT NOT NULL REFERENCES Chatmessage(messageid) --message will contain ownerid

)


