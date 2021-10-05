const mysql = require("mysql");
const { promisify } = require("util");
const fs = require("fs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Peacedu07",
  database: "groupomania",
});

connection.query = promisify(connection.query);

exports.create = (req, res, next) => {
  if (req.body.userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    let date = new Date().toISOString().slice(0, 19).replace("T", " ");
    let bodyRequest = req.body.text;
    let bodySave = bodyRequest.replace(`'`, `''`);
    connection
      .query(
        `INSERT INTO Comment(user_id, post_id, body, date) values (?, ?, ?, ?)`,
        [req.body.userId, req.body.post_id, bodySave, date]
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