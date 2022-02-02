const jwt = require("jsonwebtoken");

const fs = require("fs");

const connection = require("../service/database");

exports.create = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "M0N_T0K3N_3ST_1NTR0UV4BL3");
  const userId = `${decodedToken.userId}`;

  if (req.body.userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    let date = new Date().toISOString().slice(0, 19).replace("T", " ");
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
  }
};

exports.update = (req, res, next) => {
  if (req.body.userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    if (req.body.userId != results[0].user_id) {
      // Si l'id n'est pas le même que celui qui a créer le post
      res
        .status(403)
        .json({ error: "vous ne pouvez pas modifier ce commentaire" });
    } else {
      let bodyRequest = req.body.text; // Attention au text
      l;
      connection
        .query(`UPDATE Comment set body = ? where post_id = ?`, [
          bodyRequest,
          req.body.post_id,
        ])
        .then(() => res.status(201).json({ message: "Commentaire modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    }
  }
};

exports.delete = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "M0N_T0K3N_3ST_1NTR0UV4BL3");
  const userId = `${decodedToken.userId}`;

  if (userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {

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
};

exports.commentForOneArticle = (req, res, next) => {
  connection.query(`SELECT body from comment where post_id = ? [post_id]`);
};
