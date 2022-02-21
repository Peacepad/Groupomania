# Groupomania

## Contexte du projet

Vous êtes développeur depuis plus d'un an chez CONNECT-E, une petite agence web regroupant une douzaine d'employés.

Votre directrice, Stéphanie, invite toute l'agence à prendre un verre pour célébrer une bonne nouvelle ! Elle vient de signer un contrat pour un nouveau projet ambitieux ! 🥂

Le client en question est Groupomania, un groupe spécialisé dans la grande distribution et l'un des plus fidèles clients de l'agence.

Le projet consiste à construire un réseau social interne pour les employés de Groupomania. Le but de cet outil est de faciliter les interactions entre collègues. Le département RH de Groupomania a laissé libre cours à son imagination pour les fonctionnalités du réseau et a imaginé plusieurs briques pour favoriser les échanges entre collègues.

## Pré-requis

Téléchargez et installez Node.js  
[Site officiel de NodeJS](https://nodejs.org/)

Télécharger et installer MySQL  
[Site officiel de MySQL](https://www.mysql.com/)

## Installation



Ouvrez le terminal dans le dossier du projet et exécutez les commandes suivantes:

* ``cd backend``

* ``npm install``

* ``nodemon server``

Ouvrez un nouveau terminal dans le dossier du projet, exécutez les commandes :

* ``cd frontend``

* ``npm install``

* ``npm start``

## Notes utiles
Création de la table de donnée:
``CREATE DATABASE groupomania``

Table de création pour User:
``CREATE Table User (
user_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
email VARCHAR(40) NOT NULL UNIQUE,
password VARCHAR(70) NOT NULL,
user_imageURL VARCHAR(160) NULL,
is_Admin TINYINT DEFAULT 0
)
ENGINE=InnoDB;``

Table de création pour Post:
``CREATE TABLE Post (
post_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
post_user_id INT UNSIGNED NOT NULL,
post_body TEXT NOT NULL,
post_date DATETIME NOT NULL,
post_imageURL VARCHAR(150) NULL,
CONSTRAINT fk_user_id
FOREIGN KEY (post_user_id)
REFERENCES User(user_id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;``

Table de création pour Comment:
``CREATE TABLE Comment (
comment_post_id INT UNSIGNED NOT NULL,
comment_user_id INT UNSIGNED NOT NULL,
comment_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
comment_body TEXT NOT NULL,
comment_date DATETIME NOT NULL,
comment_imageURL VARCHAR(160) NULL,
CONSTRAINT fk_post_comment_id_number
FOREIGN KEY (comment_post_id)
REFERENCES Post(post_id),
CONSTRAINT fk_comment_creator_id_number
FOREIGN KEY (comment_user_id)
REFERENCES User(user_id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;``

Table de création pour Like_post:
``CREATE TABLE like_post (
    id int unsigned primary key auto_increment,
   like_post_id INT UNSIGNED NOT NULL,
    like_user_id INT UNSIGNED NOT NULL,
    constraint fk_post
    foreign key (like_post_id)
    references post(post_id),
    constraint fk_liker
    foreign key (like_user_id)
   references user(user_id) )
   engine=innodb;``
