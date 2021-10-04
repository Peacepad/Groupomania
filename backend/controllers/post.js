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
  let date = new Date().toISOString().slice(0, 19).replace("T", " ");
  let bodyRequest = req.body.text;
  let bodySave = bodyRequest.replace(`'`, `''`);

  if (req.file) {
    connection
      .query(
        `INSERT INTO Post(user_id, body, date, imageURL) values (?, ?, ?, ?)`,
        [
          req.body.userId,
          bodySave,
          date,
          `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        ]
      )
      .then(() => res.status(201).json({ message: "Post créé !" }))
      .catch((error) => res.status(400).json({ error }));
  }
  connection
    .query(`INSERT INTO Post(user_id, body, date) values (?, ?, ?)`, [
      req.body.userId,
      bodySave,
      date,
    ])
    .then(() => res.status(201).json({ message: "Post créé !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.update = (req, res, next) => {
  if (req.body.userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    if (req.body.userId != results[0].user_id) {
      // Si l'id n'est pas le même que celui qui a créer le post
      res.status(403).json({ error: "vous ne pouvez pas modifier ce post" });
    } else {
      if (req.file) {
        // S'il y a une requête pour changer l'image
        connection
          .query(`SELECT imageURL from Post where post_id = ?`, [post_id])
          .then((results) => {
            const filepath = results[0];
            fs.unlinkSync(filepath);
          })
          .catch((error) => res.status(500).json);
        connection
          .query(
            `UPDATE Post SET imageURL = '${req.protocol}://${req.get(
              "host"
            )}/images/${req.file.filename}' where post_id=?`,
            [post_id]
          )
          .then(() => res.status(200).json({ message: "image modifiée !" }))
          .catch((error) =>
            res.status(400).json({ error: "image non modifiée" })
          );
      }
      let bodyRequest = req.body.text; // Attention au text
      let bodySave = bodyRequest.replace(`'`, `''`);
      connection
        .query(`UPDATE POST set body = ? where post_id = ?`, [
          bodySave,
          req.body.post_id,
        ])
        .then(() => res.status(201).json({ message: "Post modifié !" }))
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
      res.status(403).json({ error: "vous ne pouvez pas supprimer ce post" });
    } else {
      connection
        .query(`DELETE from Post where post_id=?`, [req.body.post_id])
        .then(() => res.status(202).json({ message: "Le post à été supprimé" }))
        .catch((error) =>
          res.status(402).json({ error: "erreur lors de la suppression" })
        );
    }
  }
};

exports.getPost = (req, res, next) => {
  if (req.body.userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {
    connection
      .query("Select * from Post")
      .then((post) => res.status(200).json(post)
      )
      .catch((error) => res.status(500).send("server issue"));
  }
};
