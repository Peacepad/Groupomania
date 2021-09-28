const mysql = require("mysql");
const { promisify } = require("util");
const fs = require("fs");

const connection = require('../services/database')

exports.create = (req, res, next) => {
  let date = new Date().toISOString().slice(0, 19).replace("T", " ");
  let bodyRequest = req.body.body;
  let bodySave = bodyRequest.replace(`'`, `''`);
  let filepath = `${req.protocol}://${req.get("host")}/images/${
    req.file.filename
  }`;

  connection
    .query(
      `INSERT INTO Post(user_id, body, date, imageURL) values (${req.body.userId},'${bodySave}', '${date}', '${filepath}')`
    )
    .then(() => res.status(201).json({ message: "Post créé !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.update = (req, res, next) => {
  //Vérification de l'utilisateur, il faut que l'utilisateur qui demande à changer le post soit le créateur

  function verifiedUser(results) {
    if (req.body.userId != results[0].user_id) {
      res.status(403).json({ error: "vous ne pouvez pas modifier ce post" });
    } else {
      if (req.file) {
        connection
          .query(`SELECT imageURL from Post where post_id = '${post_id}'`)
          .then((results) => {
            const filepath = results[0];
            fs.unlinkSync(filepath);
          })
          .catch((error) => res.status(500).json);
        connection
          .query(
            `UPDATE Post SET imageURL = '${req.protocol}://${req.get(
              "host"
            )}/images/${req.file.filename}' where post_id='${post_id}`
          )
          .then(() => res.status(200).json({ message: "image modifiée !" }))
          .catch((error) =>
            res.status(400).json({ error: "image non modifiée" })
          );
      }
      let bodyRequest = req.body.body;
      let bodySave = bodyRequest.replace(`'`, `''`);
      connection
        .query(
          `UPDATE POST set body = '${bodySave}' where post_id=${req.body.post_id}`
        )
        .then(() => res.status(201).json({ message: "Post modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    }
  }

  connection
    .query(`Select user_id from post where post_id=${req.body.post_id}`)
    .then((results) => {
      verifiedUser(results);
      
    });
};

exports.delete = (req, res, next) => {

  function verifiedUser(results) {
    if (req.body.userId != results[0].user_id) {
      res.status(403).json({ error: "vous ne pouvez pas supprimer ce post" });
    } else {
      connection.query(`DELETE from Post where post_id=${req.body.post_id}`)
      .then(() => res.status(202).json({message: "Le post à été supprimé"}))
      .catch((error) => res.status(402).json({error: "erreur lors de la suppression"}))
    };
  }

  connection
    .query(`Select user_id from post where post_id=${req.body.post_id}`)
    .then((results) => {
      verifiedUser(results);
      
    });
}