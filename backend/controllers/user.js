const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const connection = require('../service/database');

exports.signup = (req, res, next) => {
  const regex = [
    (firstnameRegEx = /^[a-z '-]+$/i),
    (lastnameRegEx = /^[a-z '-]+$/i),
    (emailRegEx = /.+\@.+\..+/),
    (passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/),
  ];

  const needVerification = [
    (firstname = req.body.firstname),
    (lastname = req.body.lastname),
    (email = req.body.email),
    (password = req.body.password),
  ];

  if (
    firstnameRegEx.test(firstname) &&
    lastnameRegEx.test(lastname) &&
    emailRegEx.test(email) &&
    passwordRegEx.test(password)
  ) {
    // Verification que l'adresse mail n'existe pas déjà afin de pouvoir créer le compte
    connection
      .query(`SELECT email from User where email = ?`, [req.body.email])
      .then((results) => {
        if (results[0]) {
          res.status(401).json({ message: "le compte existe déjà" });
        } else {
          bcrypt
            .hash(req.body.password, 10)
            .then((hash) => {
              connection.query(
                `insert into User(firstname,lastname,email,password) values(?,?,?,?)`,
                [req.body.firstname, req.body.lastname, req.body.email, hash]
              );
            })
            .then(() => {
              return res.status(201).json({ message: "Utilisateur créé !" });
            })
            .catch((error) => {
              return res.status(400).json({ error });
            });
        }
      });
  } else {
    res.status(402).json({
      message: "Les données envoyées ne respectent pas le format requis",
    });
  }
};

exports.login = (req, res, next) => {
  try {
    connection
      .query(`SELECT email, user_id, password from User where email = ?`, [
        req.body.email,
      ])
      .then((results) => {
        if (results.length == 0 || req.body.email == undefined) {
          // Vérification que l'utilisateur existe dans la base de donnée
          res.status(401).end("Utilisateur ou mot de passe incorrect !");
        } else if (req.body.password == undefined) {
          // Vérification qu'un mot de passe soit bien tapé
          res.status(401).end("Utilisateur ou mot de passe incorrect !");
        } else {
          // Si les deux premières conditions sont bonnes -> Vérification du mot de passe avec la base de donnée
          bcrypt
            .compare(req.body.password, results[0].password)
            .then((valid) => {
              if (!valid) {
                // Si les mots de passe sont différents
                return res
                  .status(401)
                  .json({ error: "Utilisateur ou mot de passe incorrect !" });
              }

              res.status(200).json({
                // Si c'est bon on créer un token à partir de user_id
                token: jwt.sign(
                  {
                    userId: results[0].user_id,
                  },
                  "M0N_T0K3N_3ST_1NTR0UV4BL3",
                  { expiresIn: "24h" }
                ),
              });
            });
        }
      });
  } catch {
    res.status(500).send("server issue");
  }
};

exports.update = (req, res, next) => {
  if (req.params.id === null) {
    // Si aucun userId n'est donné lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    connection
      .query(`SELECT user_id from User where user_id=?`, [req.params.id])
      .then((results) => {
        //Vérification que l'utilisateur qui veut modifier le profil soit l'utilisateur lui-même
        if (results[0] === undefined || req.params.id != results[0].user_id) {
          return res
            .status(401)
            .end("Vous ne pouvez pas modifier cet utilisateur");
        } else {
          const { firstname, lastname, email, password } = req.body;
          if (password) {
            // S'il change que le mot de passe
            bcrypt
              .hash(req.body.password, 10)
              .then((hash) => {
                connection.query(
                  `UPDATE User SET password = ? where user_id = ?`,
                  [hash, req.params.id]
                );
              })
              .then(() => {
                return res
                  .status(201)
                  .json({ message: "mot de passe modifié !" });
              })
              .catch((error) => res.status(400).json({ error }));
          } else if (req.file) {
            // S'il modifie l'image
            connection
              .query(`SELECT imageURL from User where user_id = ?`, [req.params.id])
              .then((results) => {
                const filepath = results[0];
                fs.unlinkSync(filepath);
              })
              .catch((error) => res.status(500).json);

            connection
              .query(
                `UPDATE User SET imageURL = '${req.protocol}://${req.get(
                  "host"
                )}/images/${req.file.filename}' where user_id=?`,
                [req.params.id]
              )
              .then(() => res.status(200).send({ message: "image modifiée !" }))
              .catch((error) =>
                res.status(400).send({ error: "image non modifiée" })
              );
          } else {
            // S'il modifie son prénom, nom ou adresse mail
            connection
              .query(
                `UPDATE User SET firstname = ?, lastname = ?, email= ? WHERE user_id = ?`,
                [firstname, lastname, email, req.params.id]
              )
              .then(res.status(201).send({ message: "Utilisateur modifié !" }))
              .catch({ error: "utilisateur non modifié" });
          }
        }
      })
      .catch(console.log("erreur serveur"));
  }
};

exports.getOneUser = (req, res, next) => {
  connection
    .query(
      `
  select firstname, lastname, email, imageUrl, user_id from User where user_id =?`,
      [req.params.id]
    )
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};

exports.getid = (req, res, next) => {


  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "M0N_T0K3N_3ST_1NTR0UV4BL3");
  const userId = `${decodedToken.userId}`;

 return res.status(201).json(userId);

};
