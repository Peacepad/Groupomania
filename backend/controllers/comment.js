const jwt = require("jsonwebtoken");

const fs = require("fs");

const connection = require('../service/database');

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
    let bodySave = bodyRequest.replace(`'`, `%'`);
    connection
      .query(
        `INSERT INTO Comment(comment_user_id, comment_post_id, comment_body, comment_date) values (?, ?, ?, ?)`,
        [userId, req.body.postId, bodySave, date]
      )
      .then(() => res.status(201).json({ message: "Commentaire créé !" }))
      .catch((error) => res.status(400).json({ error }));
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
      let bodySave = bodyRequest.replace(`'`, `''`);
      connection
        .query(`UPDATE Comment set body = ? where post_id = ?`, [
          bodySave,
          req.body.post_id,
        ])
        .then(() => res.status(201).json({ message: "Commentaire modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    }
  }
};


exports.delete = (req, res, next) => {
  if (req.body.userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    if (req.body.userId != results[0].user_id) {
      res.status(403).json({ error: "vous ne pouvez pas supprimer ce commentaire" });
    } else {
      connection
        .query(`DELETE from Comment where comment_id=?`, [req.body.comment_id])
        .then(() => res.status(202).json({ message: "Le commentaire à été supprimé" }))
        .catch((error) =>
          res.status(402).json({ error: "erreur lors de la suppression" })
        );
    }
  }
};

exports.commentForOneArticle = (req, res, next) => {
  connection.query(`SELECT body from comment where post_id = ? [post_id]`)
}