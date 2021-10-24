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