const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const mysql = require("mysql");
const { promisify } = require("util");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Peacedu07",
  database: "groupomania",
});

connection.query = promisify(connection.query);

exports.signup = (req, res, next) => {
  connection
    .query(`SELECT email from User where email = '${req.body.email}'`)
    .then((results) => {
      if (results[0]) {
        res.status(401).json({ message: "le compte existe déjà" });
      } else {
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            connection.query(
              `insert into User(firstname,lastname,email,password) values('${req.body.firstname}','${req.body.lastname}','${req.body.email}','${hash}')`
            );
          })
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
};

exports.login = (req, res, next) => {
  try {
    connection
      .query(
        `SELECT email, user_id, password from User where email = '${req.body.email}'`
      )
      .then((results) => {
        if (results.length == 0) {
          res.status(401).end("Utilisateur ou mot de passe incorrect !");
        } else if (req.body.password == undefined) {
          res.status(401).end("Utilisateur ou mot de passe incorrect !");
        } else {
          bcrypt
            .compare(req.body.password, results[0].password)
            .then((valid) => {
              if (!valid) {
                return res
                  .status(401)
                  .json({ error: "Utilisateur ou mot de passe incorrect !" });
              }

              res.status(200).json({
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
  // Il faut vérifier que celui qui veut modifier soit l'utilisateur

  function verifiedUser(results) {
    if (req.body.userId != results[0].user_id) {
      res.status(403).json({ error: "vous ne pouvez pas modifier ce post" });
    } else {
      const { userId, firstname, lastname, email, password } = req.body;

      if (password) {
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            connection.query(
              `UPDATE User SET password = '${hash}' where user_id = ${userId} `
            );
          })
          .then(() =>
            res.status(201).json({ message: "mot de passe modifié !" })
          )
          .catch((error) => res.status(400).json({ error }));
      } else if (req.file) {
        connection
          .query(`SELECT imageURL from User where user_id = ${userId}`)
          .then((results) => {
            const filepath = results[0];
            fs.unlinkSync(filepath);
          })
          .catch((error) => res.status(500).json);

        connection
          .query(
            `UPDATE User SET imageURL = '${req.protocol}://${req.get(
              "host"
            )}/images/${req.file.filename}' where user_id='${userId}'`
          )
          .then(() => res.status(200).json({ message: "image modifiée !" }))
          .catch((error) =>
            res.status(400).json({ error: "image non modifiée" })
          );
      } else {
        connection
          .query(
            `UPDATE User SET firstname = ?, lastname = ?, email= ? WHERE user_id = ?`,
            [firstname, lastname, email, userId]
          )
          .then(res.status(201).json({ message: "Utilisateur modifié !" }))
          .catch(res.status(401).json({ error: "utilisateur non modifié" }));
      }
    }
  }

  if(req.body.userId) {
  connection
    .query(`Select user_id from User where user_id='${req.body.userId}'`)
    .then((results) => {
      verifiedUser(results);
      console.log(results);
    });}
    else {
      res.status(403).end("L'id utilisateur n'a pas été detecté")
    }
};

exports.getOneUser = (req, res, next) => {
  connection
    .query(
      `
  select firstname, lastname, email, imageUrl from User where user_id =${req.body.userId}`
    )
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};
