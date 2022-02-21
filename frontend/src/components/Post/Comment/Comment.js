import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faImage,
  faArrowDown,
  faArrowUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import {
  Avatar,
  Popover,
  Menu,
  Position,
  EditIcon,
  TrashIcon,
  Button,
} from "evergreen-ui";
import EditComment from "./EditComment";
import { Link } from "react-router-dom";

const Comment = ({ post, playOnce, setPlayOnce }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const verifyUser = userData && userData.isAdmin;
  const { register, handleSubmit, setValue } = useForm({
    mode: "onChange",
  });
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);

  const sendComment = async (data) => {
    const token = localStorage.getItem("token");

    let commentData = new FormData();

    const image = data.image[0];

    commentData.append("userId", token);
    commentData.append(`text`, data.text);
    commentData.append("postId", post.post_id);
    commentData.append("image", image);

    if (data.text.trim() == false) {
      // Empêche l'envoi d'un champ vide
      document
        .getElementById(`comment-for-post__${post.post_id}`)
        .classList.add("shake");
      setTimeout(() => {
        document
          .getElementById(`comment-for-post__${post.post_id}`)
          .classList.remove("shake");
      }, 1000);
    } else {
      axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_HOST}/api/comment/${post.post_id}`,
        data: commentData,
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: "Bearer " + token,
        },
      })
        .then(() => {
          setPlayOnce(!playOnce);
          setValue("text", "");
          document.getElementById(`comment-form__${post.post_id}`).reset();
          document.getElementById(
            `comment-for-post__${post.post_id}`
          ).style.height = "42px";
          

          setIsSuccessfullySubmitted(true);

          setTimeout(() => {
            setIsSuccessfullySubmitted(false);
          }, 1500);
        })
        .catch(function (error) {
          //handle error
          console.log(error);
          if (error.response) {
            document
              .getElementById(`comment-for-post__${post.post_id}`)
              .classList.add("shake");
            setTimeout(() => {
              document
                .getElementById(`comment-for-post__${post.post_id}`)
                .classList.remove("shake");
            }, 1000);
          }
        });
    }
  };

  const deleteComment = (comment_id) => {
    const token = localStorage.getItem("token");
    axios({
      method: "DELETE",
      url: `${process.env.REACT_APP_API_HOST}/api/comment/${comment_id}`,
      headers: {
        authorization: "Bearer " + token,
      },
    })
      .then(() => {
        setPlayOnce(!playOnce);
        document.getElementById(`comment-form__${post.post_id}`).reset();
      })
      .catch(() => console.log("Le commentaire n'a pas pu être supprimé"));
  };

  // Afficher la date sous le bon format

  const showDate = (comment) => {
    let mySqlDate = comment.comment_date;

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

  const showEditComment = (comment) => {
    const showEditCommentDOM = document.getElementById(
      `edit-comment-container__${comment.comment_id}`
    );

    const editCommentAreaDOM = document.getElementById(
      `edit-comment-body__${comment.comment_id}`
    );

    if (showEditCommentDOM.style.display === "flex") {
      if (
        document.getElementById(`edit-comment-container__${comment.comment_id}`)
      ) {
        const showEditCommentDOM = document.getElementById(
          `edit-comment-container__${comment.comment_id}`
        );
        showEditCommentDOM.style.display = "none";

        const editCommentBackgroundDOM = document.getElementById(
          `edit-comment-background__${comment.comment_id}`
        );
        editCommentBackgroundDOM.style.display = "none";
        document.getElementById(
          `one-comment__${comment.comment_id}`
        ).style.display = "flex";
      }
    } else {
      if (
        document.getElementById(`edit-comment-container__${comment.comment_id}`)
      ) {
        const showEditCommentDOM = document.getElementById(
          `edit-comment-container__${comment.comment_id}`
        );
        showEditCommentDOM.style.display = "flex";

        const editCommentBackgroundDOM = document.getElementById(
          `edit-comment-background__${comment.comment_id}`
        );
        editCommentBackgroundDOM.style.display = "flex";
        document.getElementById(
          `one-comment__${comment.comment_id}`
        ).style.display = "none";
      }
      if (editCommentAreaDOM) {
        // Mettre le focus à la fin du texte et non au début
        editCommentAreaDOM.focus();

        editCommentAreaDOM.selectionStart = editCommentAreaDOM.value.length;
      }
    }
  };



  // Agrandir le champ d'écriture
  const growTextarea = (post) => {
    const textarea = document.getElementById(
      `comment-for-post__${post.post_id}`
    );

    textarea.addEventListener("input", (e) => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";

      if (textarea.clientHeight > 97) {
        textarea.style.overflowY = "scroll";
      }
      if (textarea.clientHeight < 97) {
        textarea.style.overflowY = "hidden";
      }
    });
  };

  // Permet d'afficher "Afficher plus" s'il y a beaucoup de commentaires
  const calculateCommentsArea = () => {
    let el = document.getElementById(`comments-post__${post.post_id}`);
    if (el) {
      if (el.clientHeight < el.scrollHeight) {
        const showMoreComments = () => {
          el.style.maxHeight = "none";
        };

        return (
          <Link
            to="#"
            alt="Afficher plus de commentaires"
            className="button view-more"
            onClick={() => showMoreComments()}
          >
            Afficher plus{" "}
            <div className="view-more__arrow">
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </Link>
        );
      } else if (el.clientHeight === el.scrollHeight && el.clientHeight > 400) {
        const showLessComments = () => {
          el.style.maxHeight = "400px";
        };

        return (
          <Link
            to="#"
            alt="Afficher moins de commentaires"
            className="button view-more"
            onClick={() => showLessComments()}
          >
            Afficher moins{" "}
            <div className="view-more__arrow">
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
          </Link>
        );
      }
    }
  };

  return (
    <>
      <div
        className="comment-container"
        id={`comment-container__${post.post_id}`}
      >
        <form
          className="comment-form "
          id={`comment-form__${post.post_id}`}
          onSubmit={handleSubmit(sendComment)}
        >
          <textarea
            {...register(`text`)}
            placeholder="Ecrivez un commentaire ..."
            onFocus={() => growTextarea(post)}
            id={`comment-for-post__${post.post_id}`}
            className="comment-for-post"
          ></textarea>

          <label
            className="label-file"
            id={`label-file__${post.post_id}`}
          >
            <FontAwesomeIcon icon={faImage} />
            <input
              type="file"
              className="comment-file"
              
              id={`comment-file__${post.post_id}`}
              {...register(`image`)}
              name="image"
            ></input>
          </label>

          <input type="submit" className="button"></input>

          {isSuccessfullySubmitted === true && (
            <div className="success">
              Le commentaire a été envoyé avec succès{" "}
              <FontAwesomeIcon icon={faCheck} />
            </div>
          )}
        </form>
      </div>

      <div className="comments">
        <ul className="comments-list" id={`comments-post__${post.post_id}`}>
          {post.listComment
            .sort((a, b) => a.comment_id - b.comment_id)
            .map((comment) => (
              <li
                key={comment.comment_id}
                id={`comment-card${comment.comment_id}`}
                className={`comment-card`}
              >
                <EditComment comment={comment} setPlayOnce={setPlayOnce} />
                <div
                  className="one-comment"
                  id={`one-comment__${comment.comment_id}`}
                >
                  <div className="comment-user">
                    <Link to={`/profil/?id=${comment.comment_user_id}`}>
                      {comment.comment_user_imageURL ? (
                        <img
                          src={comment.comment_user_imageURL}
                          alt="photo de profil de l'utilisateur"
                        />
                      ) : (
                        <Avatar color='red'
                          name={
                            comment.comment_firstname +
                            " " +
                            comment.comment_lastname
                          }
                          size={40}
                        />
                      )}
                    </Link>
                  </div>
                  <div className="comment-body__container">
                    <div className="comment-body">
                      <div className="comment-body__user">
                        <p>
                          {comment.comment_firstname +
                            " " +
                            comment.comment_lastname}
                        </p>
                      </div>
                      {comment.comment_body && <p>{comment.comment_body}</p>}
                    </div>

                    {comment.comment_imageURL && (
                      <img
                        src={comment.comment_imageURL}
                        alt="illustration du commentaire"
                      />
                    )}
                  </div>
                  {(verifyUser === 1 ||
                    userData.userId === comment.comment_user_id) && (
                    <div className="comment-edit">
                      <Popover
                        className="comment-edit"
                        position={Position.BOTTOM_RIGHT}
                        content={({ close }) => (
                          <Menu>
                            <Menu.Group>
                              <Menu.Item
                                icon={EditIcon}
                                intent="success"
                                onClick={() => {
                                  showEditComment(comment);
                                  close();
                                }}
                              >
                                Éditer...
                              </Menu.Item>
                              <Menu.Item
                                icon={TrashIcon}
                                intent="danger"
                                onClick={() =>
                                  deleteComment(comment.comment_id)
                                }
                              >
                                Supprimer...
                              </Menu.Item>
                            </Menu.Group>
                          </Menu>
                        )}
                      >
                        <Button className="comment-edit__btn">
                          <FontAwesomeIcon icon={faEllipsisH} />
                        </Button>
                      </Popover>
                    </div>
                  )}

                  <div className="comment-date">{showDate(comment)}</div>
                </div>
              </li>
            ))}
        </ul>
        {calculateCommentsArea(post)}
      </div>
    </>
  );
};

export default Comment;
