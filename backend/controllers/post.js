const mysql = require("mysql");
const { promisify } = require("util");
const fs = require("fs");
const jwt = require('jsonwebtoken');

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

  //
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'M0N_T0K3N_3ST_1NTR0UV4BL3');
  const userId = `${decodedToken.userId}`;

  //

  if (req.file) {

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
    connection
      .query(
        `INSERT INTO Post(user_id, body, date, imageURL) values (?, ?, ?, ?)`,
        [
          userId,
          bodySave,
          date,
          imageUrl,
        ]
      )
      .then(() => {return res.status(201).json("Post créé !")})
      .catch(() => {return res.status(401).send("le post n'a pas pu être créé")});
  }
  else {
  connection
    .query(`INSERT INTO Post(user_id, body, date) values (?, ?, ?)`, [
      userId,
      bodySave,
      date,
    ])
    .then(() => {return res.status(201).json({ message: "Post créé !" })})
    .catch(() => {return res.status(400).send("le post n'a pas pu être créé")});
  }
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
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'M0N_T0K3N_3ST_1NTR0UV4BL3');
  const userId = `${decodedToken.userId}`;

  if (userId === null) {
    // S'il n'y a pas d'id lors de la requête
    return res.status(401).end("Utilisateur non identifié");
  } else {

    connection.
    query(`SELECT user_id from Post where post_id = ?`,[req.params.id])
.then(
      (results) => {
        console.log(results[0].user_id)
        if (userId != results[0].user_id) 
        {
        return res.status(403).json({ error: "vous ne pouvez pas supprimer ce post" });
      } else {
        connection
          .query(`DELETE from Post where post_id=?`, [req.params.id])
          .then(() => res.status(202).json({ message: "Le post à été supprimé" }))
          .catch(() =>
            {return res.status(402).json({ error: "erreur lors de la suppression" })}
          );
      }
      }
   )
   .catch(() => {return res.status(403).json({ error: "Non vous ne pouvez pas supprimer ce post" });})
    
  }
};

exports.getPost = (req, res, next) => {
 
    connection
      .query("Select * from post JOIN (select firstname, lastname, user_id from user) as user ON user.user_id = post.user_id")
      .then((post) => res.status(200).json(post)
      )
      .catch((error) => res.status(500).send("server issue"));

};
