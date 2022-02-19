const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const connection = require("../service/database");

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
  // Verification du role de l'utilisateur
  connection
    .query("select is_admin FROM user where email = ?", [req.body.email])
    .then((results) => {
      if (results[0].is_admin === 1) {
        // Si l'utilisateur est admin

        try {
          connection
            .query(
              `SELECT email, firstname, lastname, user_imageURL, user_id, password from User where email = ?`,
              [req.body.email]
            )
            .then((results) => {
              if (results.length == 0 || req.body.email == undefined) {
                // Vérification que l'utilisateur existe dans la base de donnée
                res.status(401).send("Utilisateur ou mot de passe incorrect !");
              } else if (req.body.password == undefined) {
                // Vérification qu'un mot de passe soit bien tapé
                res.status(401).send("Utilisateur ou mot de passe incorrect !");
              } else {
                // Si les deux premières conditions sont bonnes -> Vérification du mot de passe avec la base de donnée

                const userEmail = results[0].email;
                const userFirstname = results[0].firstname;
                const userLastname = results[0].lastname;
                const userImageURL = results[0].user_imageURL;
                const userId = results[0].user_id;

                bcrypt
                  .compare(req.body.password, results[0].password)
                  .then((valid) => {
                    if (!valid) {
                      // Si les mots de passe sont différents
                      return res.status(401).json({
                        error: "Utilisateur ou mot de passe incorrect !",
                      });
                    }

                    res.status(200).json({
                      // Si c'est bon on créer un token à partir de user_id
                      token: jwt.sign(
                        {
                          userId: results[0].user_id,
                          isAdmin: true,
                        },
                        process.env.DB_TOKEN,
                        { expiresIn: "24h" }
                      ),
                      userData: JSON.stringify({
                        userEmail,
                        userFirstname,
                        userLastname,
                        userImageURL,
                        userId,
                        isAdmin: 1,
                      }),
                    });
                  });
              }
            });
        } catch {
          () => {
            return res.status(500).send("server issue");
          };
        }
      } else {
        // Si l'utilisateur n'est pas admin
        try {
          connection
            .query(
              `SELECT email, firstname, lastname, user_imageURL, user_id, password from User where email = ?`,
              [req.body.email]
            )
            .then((results) => {
              if (results.length == 0 || req.body.email == undefined) {
                // Vérification que l'utilisateur existe dans la base de donnée
                res.status(401).send("Utilisateur ou mot de passe incorrect !");
              } else if (req.body.password == undefined) {
                // Vérification qu'un mot de passe soit bien tapé
                res.status(401).send("Utilisateur ou mot de passe incorrect !");
              } else {
                // Si les deux premières conditions sont bonnes -> Vérification du mot de passe avec la base de donnée

                const userEmail = results[0].email;
                const userFirstname = results[0].firstname;
                const userLastname = results[0].lastname;
                const userImageURL = results[0].user_imageURL;
                const userId = results[0].user_id;

                bcrypt
                  .compare(req.body.password, results[0].password)
                  .then((valid) => {
                    if (!valid) {
                      // Si les mots de passe sont différents
                      return res.status(401).json({
                        error: "Utilisateur ou mot de passe incorrect !",
                      });
                    }

                    res.status(200).json({
                      // Si c'est bon on créer un token à partir de user_id
                      token: jwt.sign(
                        {
                          userId: results[0].user_id,
                        },
                        process.env.DB_TOKEN,
                        { expiresIn: "24h" }
                      ),
                      userData: JSON.stringify({
                        userEmail,
                        userFirstname,
                        userLastname,
                        userImageURL,
                        userId,
                        isAdmin: 0,
                      }),
                    });
                  });
              }
            });
        } catch {
          () => {
            return res.status(500).send("server issue");
          };
        }
      }
    })
    .catch(() => {
      return res.status(500).send("server issue");
    });
};

exports.update = (req, res, next) => {
  const userId = parseInt(req.params.id);

  if (res.locals.isAdmin == "true" || userId == res.locals.userId) {
    const { firstname, lastname, email, password } = req.body;

    if (req.file) {
      // S'il modifie l'image
      connection
        .query(`SELECT user_imageURL from User where user_id = ?`, [userId])
        .then((results) => {
          if (results[0].user_imageURL != null) {
            const file = results[0].user_imageURL;
            const filename = file.split("/images/")[1];

            const filepath = `./images/${filename}`;
            fs.unlinkSync(filepath);

            const newFile = `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`;

            connection
              .query(
                `UPDATE User SET user_imageURL = '${newFile}' where user_id = ?`,
                [parseInt(userId)]
              )
              .then(() => {
                return res.status(201).json({ userImageURL: newFile });
              })
              .catch(() => {
                return res.write("image non modifiée !");
              });
          } else {
            const newFile = `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`;

            connection
              .query(
                `UPDATE User SET user_imageURL = '${newFile}' where user_id = ?`,
                [parseInt(userId)]
              )
              .then(() => {
                return res.status(201).json({ userImageURL: newFile });
              })
              .catch(() => {
                return res.write("image non modifiée !");
              });
          }
        })
        .catch(() => {
          return res.end("image non supprimée");
        });
    } else {
      // S'il modifie son prénom, nom ou adresse mail
      connection
        .query(
          `UPDATE User SET firstname = ?, lastname = ?, email= ? WHERE user_id = ?`,
          [firstname, lastname, email, userId]
        )
        .then(
          res.status(201).json({
            userFirstname: firstname,
            userLastname: lastname,
            userEmail: email,
          })
        )
        .catch({ error: "utilisateur non modifié" });
    }
  } else {
    return res.status(401).json("Vous ne pouvez pas modifier cet utilisateur");
  }
};

exports.getOneUser = (req, res, next) => {
  connection
    .query(
      `
  select firstname, lastname, email, user_imageUrl, user_id from User where user_id =?`,
      [req.params.id]
    )
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};

exports.delete = (req, res, next) => {
  const userId = req.params.id;
  if (res.locals.isAdmin == "true" || userId == res.locals.userId) {
    
    connection.query("start transaction");

    try {
      // On supprime les photos des commentaires
      let sql = `SELECT comment_imageURL FROM comment where comment_user_id = ${userId}`;

      connection.query(sql, (err, results) => {
        if (err) throw err;

        for (let l = 0; l < results.length; l++) {
          if (results[l].comment_imageURL !== null) {
            const file = results[l].comment_imageURL;
            const filename = file.split("/images/")[1];

            const filepath = `./images/${filename}`;
            fs.unlinkSync(filepath);

           

          connection.query(
            `UPDATE Comment SET comment_imageURL = NULL where comment_imageURL = "${results[l].comment_imageURL}"`,
          );
        
          }
        }
      });
    } catch (err) {
      connection.query("rollback");
    }

    // On supprime ses commentaires
    try {
      let sql2 = `DELETE FROM comment where comment_user_id = ${userId}`;
      connection.query(sql2, (err, results) => {
        if (err) throw err;
      });
    } catch (err) {
      connection.query("rollback");
    }

    // On supprime ses likes

    try {
      let sql3 = `DELETE FROM like_post where like_user_id = ${userId}`;
      connection.query(sql3, (err, results) => {
        if (err) throw err;
      });
    } catch (err) {
      connection.query("rollback");
    }

    // On supprime les photos des commentaires laissés sur ses posts et les likes
    try {
      let sql4 = `SELECT post_id from Post WHERE post_user_id = ${userId}`;
      connection.query(sql4, (err, results) => {
        if (err) throw err;
        if (results.length != 0) {
          for (let i = 0; i < results.length; i++) {
            let mysql5 = `SELECT comment_imageURL FROM Comment where comment_post_id= ${results[i].post_id}`;

            connection.query(mysql5, (err, commentResults) => {
              if (err) throw err;
              for (let l = 0; l < commentResults.length; l++) {
                if (commentResults[l].comment_imageURL !== null) {
                  const file = commentResults[l].comment_imageURL;
                  const filename = file.split("/images/")[1];

                  const filepath = `./images/${filename}`;
                  fs.unlinkSync(filepath);

                  connection.query(
                    `UPDATE Comment SET comment_imageURL = NULL where comment_imageURL = "${results[l].comment_imageURL}"`,
                  );
                }
              }
            });

            let mysql6 = `DELETE FROM Comment WHERE comment_post_id= ${results[i].post_id}`;

            connection.query(mysql6, (err, results) => {
              if (err) throw err;
            });

            let mysql7 = `DELETE FROM like_post WHERE like_post_id= ${results[i].post_id}`;

            connection.query(mysql7, (err, results) => {
              if (err) throw err;
            });
          }
        }
      });
    } catch (err) {
      connection.query("rollback");
    }

    // on supprime ses likes

    try {
      let mysql8 = `DELETE FROM like_post WHERE like_user_id = ${userId}`;
      connection.query(mysql8, (err, results) => {
        if (err) throw err;
      });
    } catch (err) {
      connection.query("rollback");
    }

    // on supprime les photos des posts

    try {
      let mysql9 = `SELECT post_imageURL FROM Post where post_user_id = ${userId}`;
      connection.query(mysql9, (err, results) => {
        if (err) throw err;
        for (let i = 0; i < results.length; i++) {
          if (results[i].post_imageURL !== null) {
            const file = results[i].post_imageURL;
            const filename = file.split("/images/")[1];

            const filepath = `./images/${filename}`;
            fs.unlinkSync(filepath);

            connection.query(
              `UPDATE Post SET post_imageURL = NULL where post_imageURL = "${results[i].post_imageURL}"`,
            );
          }
        }
      });
    } catch (err) {
      connection.query("rollback");
    }

    // on supprime les posts
    try {
      let mysql10 = `DELETE FROM POST where post_user_id= ${userId}`;
      connection.query(mysql10, (err, results) => {
        if (err) throw err;
      });
    } catch (err) {
      connection.query("rollback");
    }

    // on supprime la photo de profil

    try {
      let mysql11 = `SELECT user_imageURL FROM user where user_id = ${userId}`;
      connection.query(mysql11, (err, results) => {
        if (err) throw err;
        if (results[0].user_imageURL && results[0].user_imageURL !== null) {
          const file = results[0].user_imageURL;
          const filename = file.split("/images/")[1];

          const filepath = `./images/${filename}`;
          fs.unlinkSync(filepath);
        }
      });
    } catch (err) {
      connection.query("rollback");
    }

    // on supprime le profil

    try {
      let mysql12 = `DELETE FROM USER WHERE user_id = ${userId}`;
      connection.query(mysql12, (err, results) => {
        if (err) throw err;
      });
    } catch (err) {
      connection.query("rollback");
    }

    connection
      .query("commit")
      .then(() => {
        return res.status(201).json("Utilisateur supprimé");
      })
      .catch(() => {
        return res.status(401).json("Utilisateur non supprimé");
      });
  } else {
    () => {
      return res
        .status(401)
        .json("Vous ne pouvez pas supprimer cet utilisateur");
    };
  }
};
