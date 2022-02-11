const jwt = require("jsonwebtoken");

const fs = require("fs");

const connection = require("../service/database");

exports.create = (req, res, next) => {
  const userId = res.locals.userId;

  let date =
    new Date().toISOString().slice(0, 10) +
    " " +
    new Date().toLocaleTimeString("fr-fr");
  let bodyRequest = req.body.text;

  if (req.file) {
    const commentImageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
    connection
      .query(
        `INSERT INTO Comment(comment_user_id, comment_body, comment_date, comment_imageURL, comment_post_id) values (?, ?, ?, ?, ?)`,
        [userId, req.body.text, date, commentImageUrl, req.body.postId]
      )
      .then(() => {
        return res.status(201).json("commentaire créé !");
      })
      .catch(() => {
        return res.status(401).send("le commentaire n'a pas pu être créé");
      });
  } else {
    connection
      .query(
        `INSERT INTO Comment(comment_user_id, comment_post_id, comment_body, comment_date) values (?, ?, ?, ?)`,
        [userId, req.body.postId, bodyRequest, date]
      )
      .then(() => res.status(201).json({ message: "Commentaire créé !" }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.delete = (req, res, next) => {
  const userId = res.locals.userId;
  const commentId = parseInt(req.params.commentId);
  connection
    .query("SELECT comment_user_id FROM Comment WHERE comment_id = ?", [
      commentId,
    ])
    .then((results) => {
      const commentUserId = results[0].comment_user_id;

      if (res.locals.isAdmin == "true" || commentUserId == res.locals.userId) {
  
    // Suppression des images
    connection
      .query(`SELECT comment_imageURL from Comment WHERE comment_id = ?`, [
        parseInt(req.params.commentId),
      ])
      .then((results) => {
        if (results[0].comment_imageURL !== null) {
          const file = results[0].comment_imageURL;
          const filename = file.split("/images/")[1];

          const filepath = `./images/${filename}`;
          fs.unlinkSync(filepath);
        } else {
          () => {
            return console.log("il n'y a pas d'image");
          };
        }
      })
      .catch(() => {
        return console.log("image non supprimée");
      });

    connection
      .query(`DELETE from Comment where comment_id=?`, [
        parseInt(req.params.commentId),
      ])
      .then(() => {
        return res
          .status(202)
          .json({ message: "Le commentaire à été supprimé" });
      })
      .catch(() =>
        res.status(402).json({ error: "erreur lors de la suppression" })
      );
    }
  })
  .catch(() => {
    return res
      .status(402)
      .end("Vous n'avez pas l'autorisation de supprimer ce commentaire");
  });
};

exports.update = (req, res, next) => {
  const commentId = parseInt(req.params.commentId);
  connection
    .query("SELECT comment_user_id FROM Comment WHERE comment_id = ?", [
      commentId,
    ])
    .then((results) => {
      const commentUserId = results[0].comment_user_id;

      if (res.locals.isAdmin == "true" || commentUserId == res.locals.userId) {
        if (Boolean(req.body.fileDeleted) == true) {
          connection
            .query(
              `SELECT comment_imageURL from Comment where comment_id = ?`,
              [commentId]
            )
            .then((results) => {
              const file = results[0].comment_imageURL;
              const filename = file.split("/images/")[1];

              const filepath = `./images/${filename}`;
              fs.unlinkSync(filepath);
            })
            .catch(() => {
              return res.end("image non supprimée");
            });

          connection
            .query(
              "UPDATE Comment Set comment_imageURL = NULL where comment_id = ?",
              [commentId]
            )
            .then(() => {
              return res.send();
            })
            .catch(() => {
              return res.send();
            });
        }

        if (req.file) {
          // S'il y a une requête pour changer l'image
          connection
            .query(
              `SELECT comment_imageURL from comment where comment_id = ?`,
              [commentId]
            )
            .then((results) => {
              const file = results[0].comment_imageURL;
              const filename = file.split("/images/")[1];

              const filepath = `./images/${filename}`;
              fs.unlinkSync(filepath);
            })
            .catch(() => {
              return res.end("image non supprimée");
            });

          const newFile = `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`;

          connection
            .query(
              `UPDATE comment SET comment_imageURL = '${newFile}' where comment_id = ?`,
              [commentId]
            )
            .then(() => {
              return res.send();
            })
            .catch(() => {
              return console.log("image non modifée");
            });
        }

        let bodyRequest = req.body.text;

        connection
          .query(`UPDATE comment set comment_body = ? where comment_id = ?`, [
            bodyRequest,
            commentId,
          ])
          .then(() => {
            return res.send();
          })
          .catch({ error: "comment non modifié" });
      }
    })
    .catch(() => {
      return res
        .status(402)
        .end("Vous n'avez pas l'autorisation de modifier ce commentaire");
    });
};
