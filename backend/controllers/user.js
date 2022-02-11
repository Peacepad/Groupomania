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
                        "M0N_T0K3N_3ST_1NTR0UV4BL3",
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
                        "M0N_T0K3N_3ST_1NTR0UV4BL3",
                        { expiresIn: "24h" }
                      ),
                      userData: JSON.stringify({
                        userEmail,
                        userFirstname,
                        userLastname,
                        userImageURL,
                        userId,
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

  if (res.locals.isAdmin == 'true' || userId == res.locals.userId) {
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
  select firstname, lastname, email, imageUrl, user_id from User where user_id =?`,
      [req.params.id]
    )
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};

exports.delete = (req, res, next) => {
  if (res.locals.isAdmin == 'true' || userId == res.locals.userId) {
  const userId = req.params.id;

  // on supprime ses photos des commentaires

  connection
    .query("SELECT comment_imageURL FROM comment where comment_user_id = ?", [
      userId,
    ])
    .then((results) => {
      if (results.length !== 0) {
        for (let i = 0; i <= results.length; i++) {
          if (results[i].comment_imageURL !== null) {
            const file = results[i].comment_imageURL;
            const filename = file.split("/images/")[1];

            const filepath = `./images/${filename}`;
            fs.unlinkSync(filepath);
          }
        }
      }
    })
    .catch(() => {
      console.log("les images des commentaires n'ont pas été supprimées");
    });
  // on supprime ses commentaires

  connection
    .query("DELETE FROM comment where comment_user_id = ?", [userId])
    .then(() => {
      return console.log("commentaires de l'utilisateur supprimés");
    })
    .catch(() => {
      return console.log("commentaires de l'utilisateur non supprimés");
    });
  // on supprime ses likes

  connection
    .query("DELETE FROM like_post where like_user_id = ?", [userId])
    .then(() => {
      return console.log("j'aime supprimés");
    })
    .catch(() => {
      return console.log("j'aime non supprimés");
    });

  // on supprime les photos des commentaires laissés sur ses posts et les likes
  connection
    .query("SELECT post_id from Post WHERE post_user_id = ?", [userId])
    .then((results) => {
      if (results.length != 0) {
        for (let i = 0; i < results.length; i++) {
          connection
            .query(
              "SELECT comment_imageURL FROM Comment where comment_post_id= ?",
              [results[i].post_id]
            )
            .then((commentResults) => {
              for (let l = 0; l < commentResults.length; l++) {
                if (commentResults.comment_imageURL !== null) {
                  const file = commentResults[0].comment_imageURL;
                  const filename = file.split("/images/")[1];

                  const filepath = `./images/${filename}`;
                  fs.unlinkSync(filepath);
                }
              }
            })
            .catch(() => {
              return console.log(
                "images des commentaires liés aux posts créés par l'utilisateur non supprimés"
              );
            });

          connection
            .query("DELETE FROM Comment WHERE comment_post_id=?", [
              results[i].post_id,
            ])
            .then(() => {
              return console.log(
                "commentaires liés aux posts de l'utilisateur supprimés"
              );
            })
            .catch(() => {
              return console.log(
                "commentaires liés aux posts de l'utilisateur non supprimés"
              );
            });

          connection
            .query("DELETE FROM like_post WHERE like_post_id=?", [
              results[i].post_id,
            ])
            .then(() => {
              return console.log(
                "like laissés sur les posts de l'utilisateur supprimés"
              );
            })
            .catch(() => {
              return console.log(
                "like laissés sur les posts de l'utilisateur none supprimés"
              );
            });
        }
      }
    });

  // on supprime ses likes

  connection
    .query("DELETE FROM like_post WHERE like_user_id = ?", [userId])
    .then(() => {
      console.log("likes de l'utilisateur supprimés");
    })
    .catch(() => {
      console.log("likes de l'utilisateur non supprimés");
    });

  // on supprime les photos des posts

  connection
    .query("SELECT post_imageURL FROM Post where post_user_id = ?", [userId])
    .then((results) => {
      for (let i = 0; i < results.length; i++) {
        if (results[i].post_imageURL !== null) {
          const file = results[0].post_imageURL;
          const filename = file.split("/images/")[1];

          const filepath = `./images/${filename}`;
          fs.unlinkSync(filepath);
        }
      }
    })
    .catch(() => {
      return console.log("les images des posts n'ont pas été supprimées");
    });
  // on supprime les posts

  connection
    .query("DELETE FROM POST where post_user_id= ?", [userId])
    .then(() => {
      return console.log("posts écrit par l'utilisateur supprimés");
    })
    .catch(() => {
      return console.log("posts de l'utilisateur non supprimés");
    });

  // on supprime la photo de profil

  connection
    .query("SELECT user_imageURL FROM user where user_id = ?", [userId])
    .then((results) => {
      if (results.user_imageURL !== null) {
        const file = results[0].user_imageURL;
        const filename = file.split("/images/")[1];

        const filepath = `./images/${filename}`;
        fs.unlinkSync(filepath);
      }
    })
    .catch(() => {
      return console.log("l'image de l'utilisateur n'a pas été supprimée");
    });

  // on supprime le profil

  connection
    .query("DELETE FROM USER WHERE user_id = ?", [userId])
    .then(() => {
      return res.status(201).json("user delete");
    })
    .catch(() => {
      return res.status(401).json("user not delete");
    });
  }
  else {
    return res.status(401).json("Vous ne pouvez pas supprimer cet utilisateur");
  }
};
