const mysql = require("mysql");

const fs = require("fs");
const jwt = require("jsonwebtoken");

const connection = require("../service/database");

exports.create = (req, res, next) => {
  let date =
    new Date().toISOString().slice(0, 10) +
    " " +
    new Date().toLocaleTimeString("fr-fr");

  //
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "M0N_T0K3N_3ST_1NTR0UV4BL3");
  const userId = `${decodedToken.userId}`;

  //

  if (req.file) {
    const postImageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
    connection
      .query(
        `INSERT INTO Post(post_user_id, post_body, post_date, post_imageURL) values (?, ?, ?, ?)`,
        [userId, req.body.text, date, postImageUrl]
      )
      .then(() => {
        return res.status(201).json("Post créé !");
      })
      .catch(() => {
        return res.status(401).send("le post n'a pas pu être créé");
      });
  } else {
    connection
      .query(
        `INSERT INTO Post(post_user_id, post_body, post_date) values (?, ?, ?)`,
        [userId, req.body.text, date]
      )
      .then(() => {
        return res.status(201).json({ message: "Post créé !" });
      })
      .catch(() => {
        return res.status(400).send("le post n'a pas pu être créé");
      });
  }
};

exports.update = (req, res, next) => {
  const postId = req.params.id;

  connection
    .query("SELECT post_user_id FROM Post WHERE post_id = ?", [postId])
    .then((results) => {
      const postUserId = results[0].post_user_id;

      if (res.locals.isAdmin == "true" || postUserId == res.locals.userId) {
        if (Boolean(req.body.fileDeleted) == true) {
          connection
            .query(`SELECT post_imageURL from Post where post_id = ?`, [
              parseInt(req.params.id),
            ])
            .then((results) => {
              const file = results[0].post_imageURL;
              const filename = file.split("/images/")[1];

              const filepath = `./images/${filename}`;
              fs.unlinkSync(filepath);
            })
            .catch(() => {
              return res.end("image non supprimée");
            });

          connection
            .query("UPDATE Post Set post_imageURL = NULL where post_id = ?", [
              parseInt(req.params.id),
            ])
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
            .query(`SELECT post_imageURL from post where post_id = ?`, [
              parseInt(req.params.id),
            ])
            .then((results) => {
              const file = results[0].post_imageURL;
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
              `UPDATE Post SET post_imageURL = '${newFile}' where post_id = ?`,
              [parseInt(req.params.id)]
            )
            .then(() => {
              return res.send();
            })
            .catch(() => {
              return console.log("image non modifée");
            });
        }

        let bodyRequest = req.body.text; // Attention au text

        connection
          .query(`UPDATE POST set post_body = ? where post_id = ?`, [
            bodyRequest,
            parseInt(req.params.id),
          ])
          .then(() => {
            return res.send();
          })
          .catch({ error: "post non modifié" });
      }
    })
    .catch(() => {
      return res
        .status(402)
        .end("Vous n'avez pas l'autorisation de modifier ce post");
    });
};

exports.delete = (req, res, next) => {
  const postId = req.params.id;

  connection
    .query("SELECT post_user_id FROM Post WHERE post_id = ?", [postId])
    .then((results) => {
      const postUserId = results[0].post_user_id;

      if (res.locals.isAdmin == "true" || postUserId == res.locals.userId) {
        //Suppression des images du post
        connection
          .query(`SELECT post_imageURL from Post WHERE post_id = ?`, [
            parseInt(req.params.id),
          ])
          .then((results) => {
            if (results[0].post_imageURL !== null) {
              const file = results[0].post_imageURL;
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

        //Suppression des likes
        connection
          .query("DELETE FROM like_post WHERE like_post_id= ?", [req.params.id])
          .then(() => {
            return console.log("j'aime supprimés");
          })
          .catch(() => {
            return console.log("Il n'y a pas de j'aime");
          });

        //Suppression des commentaires
        connection
          .query("DELETE FROM Comment where comment_post_id=?", [req.params.id])
          .then(() => {
            return console.log("commentaires supprimés");
          })
          .catch(() => {
            return console.log("il n'y a pas de commentaires sur ce Post");
          });

        //Suppression du Post
        connection
          .query("DELETE FROM POST WHERE post_id=?", [req.params.id])
          .then(() => {
            return res.status(201).json("post supprimé");
          })
          .catch(() => {
            return res.status(401).json("post non supprimé");
          });
      }
    })
    .catch();
};

exports.getPost = (req, res, next) => {
  connection
    .query(
      "SELECT post_id, post_user_id, post_body, post_date, post_imageURL, post_user_id, likes, comment_id, comment_body, comment_date, comment_post_id, comment_imageURL, post_user.firstname AS post_firstname, post_user.lastname AS post_lastname, post_user.user_imageURL, comment_user.firstname AS comment_firstname, comment_user.lastname AS comment_lastname, comment_user.user_imageURL AS comment_user_imageURL, comment_user.user_id AS comment_user_id, like_post.id AS like_id, like_post.like_post_id AS like_post_id  FROM POST LEFT JOIN comment ON post_id = comment.comment_post_id LEFT JOIN user AS post_user ON post.post_user_id = post_user.user_id LEFT JOIN user AS comment_user ON comment.comment_user_id = comment_user.user_id LEFT JOIN like_post AS like_post ON post_id = like_post.like_post_id;"
    )
    .then((postList) => {
      const listOfAllPosts = [];
      postList.forEach((postData) => {
        const post = {
          post_id: postData.post_id,
          post_user_id: postData.post_user_id,
          post_body: postData.post_body,
          firstname: postData.post_firstname,
          lastname: postData.post_lastname,
          user_imageURL: postData.user_imageURL,
          post_imageURL: postData.post_imageURL,
          post_date: postData.post_date,
          listComment: [],
          listLike: [],
        };

        if (
          !listOfAllPosts.find(
            (postElement) => post.post_id == postElement.post_id
          )
        ) {
          listOfAllPosts.push(post);
        }
      });

      postList.forEach((likeData) => {
        if (likeData.like_id != null) {
          const like = {
            like_id: likeData.like_id,
            like_post_id: likeData.like_post_id,
          };
          const post = listOfAllPosts.find(
            (postElement) => likeData.like_post_id == postElement.post_id
          );

          if (
            !post.listLike.find(
              (likeElement) => like.like_post_id == likeElement.post_id
            )
          ) {
            if (likeData.like_id != null) {
              post.listLike.push(like);
            }
          }
        }
      });

      postList.forEach((commentData) => {
        if (commentData.comment_body != null) {
          const comment = {
            comment_post_id: commentData.comment_post_id,
            comment_id: commentData.comment_id,
            comment_firstname: commentData.comment_firstname,
            comment_lastname: commentData.comment_lastname,
            comment_body: commentData.comment_body,
            comment_imageURL: commentData.comment_imageURL,
            comment_user_imageURL: commentData.comment_user_imageURL,
            comment_user_id: commentData.comment_user_id,
            comment_date: commentData.comment_date,
          };

          const post = listOfAllPosts.find(
            (postElement) => commentData.comment_post_id == postElement.post_id
          );

          if (
            !post.listComment.find(
              (commentElement) =>
                comment.comment_post_id == commentElement.post_id
            )
          ) {
            if (commentData.comment_id != null) {
              post.listComment.push(comment);
            }
          }
        }
      });

      res.status(200).json(listOfAllPosts);
    })
    .catch((error) => res.status(500).send("server issue"));
};

exports.getLikes = (req, res, next) => {
  connection
    .query("SELECT likes from Post where post_id= ?", [req.params.id])
    .then((results) => {
      return res.status(201).json(results[0].likes);
    })
    .catch(() => {
      return res.status(401).json("Nombre de like non obtenu");
    });
};
