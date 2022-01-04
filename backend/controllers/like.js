const jwt = require("jsonwebtoken");
const connection = require("../service/database");

exports.create = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "M0N_T0K3N_3ST_1NTR0UV4BL3");
  const userId = `${decodedToken.userId}`;

  // Vérifier que l'utilisateur n'a pas déjà liké pour ce post
  connection
    .query("SELECT user_id from Like_Post where post_id = ?", [req.params.id])
    .then((results) => {
      const users = results.map((el) => el.user_id);

      if (!users.includes(parseInt(userId))) {
        // On ajoute un like

        connection.beginTransaction(function (err) {
          if (err) {
            throw err;
          } else {
            connection.query(
              "UPDATE POST SET likes = likes + 1 where post_id = ?",
              [req.params.id],
              function (error) {
                if (error) {
                  connection.rollback(function () {
                    throw error;
                  });
                } else {
                  connection.query(
                    "INSERT INTO Like_Post(user_id, post_id) values (?, ?)",
                    [parseInt(userId), req.params.id],
                    function (error, results) {
                      if (error) {
                        connection.rollback(function () {
                          throw error;
                        });
                      } else {
                        connection.commit(function (err) {
                          if (err) {
                            connection.rollback(function () {
                              throw err;
                            });
                          } else {
                            
                              return res.status(201).json("like ajouté");
                            
                          }
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        });
      } else if (users.includes(parseInt(userId))) {
        connection.beginTransaction(function (err) {
          if (err) {
            throw err;
          } else {
            connection.query(
              "UPDATE POST SET likes = likes - 1 where post_id = ?",
              [req.params.id],
              function (error) {
                if (error) {
                  connection.rollback(function () {
                    throw error;
                  });
                } else {
                  connection.query(
                    "DELETE from Like_Post where (user_id = ?) AND (post_id = ?);",
                    [parseInt(userId), req.params.id],
                    function (error, results) {
                      if (error) {
                        connection.rollback(function () {
                          throw error;
                        });
                      } else {
                        connection.commit(function (err) {
                          if (err) {
                            connection.rollback(function () {
                              throw err;
                            });
                          } else {
                            
                              return res.status(201).json("like ajouté");
                            
                          }
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    })
    .catch(() => {
      return res.status(403).json("une erreur s'est produite");
    });
};


