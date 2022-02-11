const jwt = require("jsonwebtoken");
const connection = require("../service/database");

exports.create = (req, res, next) => {
  const userId = res.locals.userId;

  // Vérifier que l'utilisateur n'a pas déjà liké pour ce post
  connection
    .query("SELECT like_user_id from Like_Post where like_post_id = ?", [
      req.params.id,
    ])
    .then((results) => {
      const users = results.map((el) => el.like_user_id);

      if (!users.includes(parseInt(userId))) {
        // On ajoute un like

        connection
          .query(
            "INSERT INTO Like_Post(like_user_id, like_post_id) values (?, ?)",
            [parseInt(userId), req.params.id]
          )
          .then(() => {
            return res.status(201).json("like incrémenté");
          })
          .catch(() => {
            return res.status(401).json("like non incrémenté");
          });
      } else if (users.includes(parseInt(userId))) {
        connection
          .query(
            "DELETE from Like_Post where (like_user_id = ?) AND (like_post_id = ?);",
            [parseInt(userId), req.params.id]
          )
          .then(() => {
            return res.status(201).json("like décrémenté");
          })
          .catch(() => {
            return res.status(401).json("like non décrémenté");
          });
      }
    });
};
