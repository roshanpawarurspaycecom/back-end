create table user(
    id int primary key AUTO_INCREMENT,
    name varchar (250),
    contactNumber varchar(50),
    email varchar(50),
    password varchar(250),
    status varchar (20),
    role varchar(20),
    UNIQUE (email)  

);

insert into user ( name,contactNumber,email,password,status,role) values(
     'Admin','123456789','admin@gmail.com','admin','true','admin'
);

create table category(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    primary key(id)
);