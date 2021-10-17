-- PERSON TABLE
create table Person (
    userId INT PRIMARY KEY NOT NULL,
    firstName varchar(50),
    lastName varchar(50),
    email varchar(50) NOT NULL,
    userPassword varchar(255)
);


