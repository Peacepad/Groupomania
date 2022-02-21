import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  Popover,
  Menu,
  Position,
  EditIcon,
  TrashIcon,
  Button,
} from "evergreen-ui";
import Like from "./Like/Like";
import { useForm } from "react-hook-form";
import Comment from "./Comment/Comment";
import { useHistory } from "react-router-dom";
import EditPost from "./EditPost";
import { Link } from "react-router-dom";

const Posts = () => {
  const history = useHistory();
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [playOnce, setPlayOnce] = useState(true);
  const token = localStorage.getItem("token") && localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData")) && JSON.parse(localStorage.getItem("userData"));
  const verifyUser = userData && userData.isAdmin;

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté il est redirigé vers la page login
    const verifyToken = () => {
      if (!token) {
        if(!userData){
        history.push("/login");}
      }
    };

    verifyToken();

    // Obtenir les données des Posts
    const getData = () => {
      if (playOnce) {
        axios({
          method: "Get",
          url: `${process.env.REACT_APP_API_HOST}/api/post`,
          headers: {
            authorization: "Bearer " + token,
          },
        }).then((res) => {
          setData(res.data);
          setPlayOnce(false);
        });
      }

      // Tri des posts pour les afficher dans le bon ordre
      const sortedPost = () => {
        const postObj = Object.keys(data).map((i) => data[i]);
        const sortedArray = postObj.sort((a, b) => {
          return b.post_id - a.post_id;
        });

        setSortedData(sortedArray);
      };
      sortedPost();
    };
    getData();
  }, [data, playOnce, token, history]);

  // Supprimer un post
  const deletePost = (post_id) => {
    axios({
      method: "DELETE",
      url: `${process.env.REACT_APP_API_HOST}/api/post/${post_id}`,
      headers: {
        authorization: "Bearer " + token,
      },
    })
      .then(() => {
        setPlayOnce(!playOnce); // Actualisation du contenu
      })
      .catch(() => {
        console.log("Le post n'a pas pu être supprimé");
      });
  };

  // ------------------------------------- Create Post ------------------

  // -------------- Afficher l'image choisie
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    setSelectedFile(e.target.files[0]);
  };
  // ------------

  const { register, handleSubmit, reset } = useForm();
  // Envoi d'un post
  const onSubmit = async (data) => {
    let formData = new FormData(); //formdata object

    formData.append("token", token);
    formData.append("text", data.text);
    formData.append("image", selectedFile);
    formData.append("userId", userData.userId);
    

    if (data.text.trim() == false) {
      // Empêche l'envoi d'un champ vide
      document.getElementById(`create-post__text`).classList.add("shake");
      setTimeout(() => {
        document.getElementById(`create-post__text`).classList.remove("shake");
      }, 1000);
    } else {
      axios({
        method: "post",
        url: `${process.env.REACT_APP_API_HOST}/api/post/create`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",

          authorization: "Bearer " + token,
        },
      })
        .then(() => {
          // On remet le champ à sa taille de base
          document.getElementById("create-post__text").style.height = "40px";
          document.getElementById("create-post__text").style.overflow =
            "hidden";

          setPlayOnce(!playOnce);
          // On remet les champs à zéro
          reset();
          setPreview(undefined);
          setSelectedFile(undefined);
        })
        .catch(function (error) {
          //handle error
          if (error.response) {
            document.getElementById("create-post__text").classList.add("shake");
            setTimeout(() => {
              document
                .getElementById("create-post__text")
                .classList.remove("shake");
            }, 1000);
          }
        });
    }
  };

  // ---------------- UpdatePost

  let postBodyDiv;

  // ------------- EditPost ----------------------------------------------------------------------------

  // Afficher la date sous le bon format

  const showDate = (post) => {
    let mySqlDate = post.post_date;
    let mySqlDate2 = mySqlDate.replace("T", " ");
    let mySqlDate3 = mySqlDate2.replace("Z", "");

    let t = `${mySqlDate3}`.split(/[- :]/);

    let mouths = [
      "janvier",
      "fevrier",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "aout",
      "septembre",
      "obtobre",
      "novembre",
      "décembre",
    ];
    let goodMouthNumber = parseInt(t[1]) - 1;

    let goodMouth = mouths[goodMouthNumber];

    let goodHour = parseInt(t[3]);

    let correctDate = `Le ${t[2]} ${goodMouth} ${t[0]} à ${goodHour}h${t[4]}`;

    return correctDate;
  };

  // Afficher l'espace pour commenter

  const showSendComment = (post) => {
    const showCommentDOM = document.getElementById(
      `comment-container__${post.post_id}`
    );

    if (showCommentDOM.style.display === "flex") {
      if (document.getElementById(`comment-container__${post.post_id}`)) {
        const showCommentDOM = document.getElementById(
          `comment-container__${post.post_id}`
        );
        showCommentDOM.style.display = "none";
      }
    } else {
      if (document.getElementById(`comment-container__${post.post_id}`)) {
        const showCommentDOM = document.getElementById(
          `comment-container__${post.post_id}`
        );
        showCommentDOM.style.display = "flex";
        // Effacement du fichier contenu dans le input file
        document.getElementById(`comment-form__${post.post_id}`).reset();
        document.getElementById(
          `label-file__${post.post_id}`
        ).style.backgroundColor = "rgb(239, 239, 239)";
      }
    }
  };

  // Afficher l'espace pour modifier un post

  const showEdit = (post) => {
    const showEditDOM = document.getElementById(
      `edit-container__${post.post_id}`
    );

    const editAreaDOM = document.getElementById(`edit-body__${post.post_id}`);

    if (showEditDOM.style.display === "flex") {
      if (document.getElementById(`edit-container__${post.post_id}`)) {
        const showEditDOM = document.getElementById(
          `edit-container__${post.post_id}`
        );
        showEditDOM.style.display = "none";
        const editBackgroundDOM = document.getElementById(
          `edit-background__${post.post_id}`
        );
        editBackgroundDOM.style.display = "none";
        // remettre le scroll
        document.documentElement.style.overflow = "scroll";
      }
    } else {
      if (document.getElementById(`edit-container__${post.post_id}`)) {
        const showEditDOM = document.getElementById(
          `edit-container__${post.post_id}`
        );
        showEditDOM.style.display = "flex";
        const editBackgroundDOM = document.getElementById(
          `edit-background__${post.post_id}`
        );
        editBackgroundDOM.style.display = "flex";
        // empecher le scroll pendant l'édition
        document.documentElement.style.overflow = "hidden";
      }
      if (editAreaDOM) {
        // Mettre le focus à la fin du texte et non au début
        editAreaDOM.focus();

        editAreaDOM.selectionStart = editAreaDOM.value.length;
      }
    }
  };

  // fAgrandir la zone de texte en fonction de ce qui est écrit
  const growTextarea = () => {
    const textarea = document.getElementById("create-post__text");

    textarea.addEventListener("input", (e) => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";

      if (textarea.clientHeight > 197) {
        textarea.style.overflowY = "scroll";
      }
      if (textarea.clientHeight < 197) {
        textarea.style.overflowY = "hidden";
      }
    });
  };

  return (
    <React.Fragment>
      <div className="create-post__container">
        <form className="create-post" onSubmit={handleSubmit(onSubmit)}>
          <div className="create-post__edit">
            <label for="create-post__text">Créer un post:</label>
            <textarea
              onFocus={() => growTextarea()}
              id="create-post__text"
              {...register("text")}
            ></textarea>

            {selectedFile && <img src={preview} alt="Aperçu du fichier" />}
          </div>

          <div className="button-container">
            <label className="button-add">
              <button className="button-add__real">Ajouter une image</button>
              <input
                type="file"
                {...register("image")}
                onChange={onSelectFile}
              />
            </label>

            <input type="submit" className="button-send"></input>
          </div>
        </form>
      </div>

      <main className="Posts">
        <ul className="post-list">
          {sortedData.map((post) => (
            <li key={post.post_id} id={post.post_id} className="post-list__li">
              <article className="post-card">
                <EditPost post={post} setPlayOnce={setPlayOnce} />

                {(verifyUser === 1 ||
                  userData.userId === post.post_user_id) && (
                  <div className="post-edit">
                    
                    <Popover
                    
                      className="post-edit"
                      position={Position.BOTTOM_RIGHT}
                      content={({ close }) => (
                        <Menu>
                          <Menu.Group>
                            <Menu.Item
                              icon={EditIcon}
                              intent="success"
                              onClick={() => {
                                showEdit(post);
                                close();
                              }}
                            >
                              Éditer...
                            </Menu.Item>
                            <Menu.Item
                              icon={TrashIcon}
                              intent="danger"
                              onClick={() => deletePost(post.post_id)}
                            >
                              Supprimer...
                            </Menu.Item>
                          </Menu.Group>
                        </Menu>
                      )}
                    >
                      <Button className="post-edit__btn">
                        <FontAwesomeIcon icon={faEllipsisH} />
                      </Button>
                    </Popover>

                  </div>
                )}

                <div className="post-info">
                  <div className="post-info__avatar">
                    <Link to={`/profil/?id=${post.post_user_id}`}>
                      {post.user_imageURL ? (
                        <img
                          src={post.user_imageURL}
                          alt="avatar de l'utilisateur"
                        />
                      ) : (
                        <Avatar color='red'
                          name={post.firstname + " " + post.lastname}
                          size={40}
                        />
                      )}
                    </Link>
                  </div>

                  <div className="post-info__about">
                    <div className="post-info__name">
                      {post.firstname + " " + post.lastname}
                    </div>

                    <div className="post-info__date">{showDate(post)}</div>
                  </div>
                </div>
                <div className="post-body" id={"post-body__" + post.post_id}>
                  <p>{post.post_body}</p>
                  {postBodyDiv}
                </div>

                <div className="post-image">
                  {post.post_imageURL != null && (
                    <img src={post.post_imageURL} alt="image du Post" />
                  )}
                </div>

                <div className="post-interact">
                  <Like post={post} setPlayOnce={setPlayOnce} />

                  <div className="post-comment">
                    <div className="post-comment__display">
                      <FontAwesomeIcon icon={faComment} />
                      {post.listComment.length}
                    </div>

                    <div
                      className="post-comment__btn"
                      onClick={() => showSendComment(post)}
                    >
                      <FontAwesomeIcon icon={faComment} /> Commenter
                    </div>
                  </div>
                </div>
              </article>

              <Comment post={post} setPlayOnce={setPlayOnce} />
            </li>
          ))}
        </ul>
      </main>
    </React.Fragment>
  );
};

export default Posts;
