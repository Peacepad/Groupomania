import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const EditPost = ({ post, playOnce, setPlayOnce }) => {
  const { register, handleSubmit } = useForm();
  const [fileDeleted, setFileDeleted] = useState(false);

  const sendEdit = (data) => {
    const token = localStorage.getItem("token");

    let editData = new FormData();

    editData.append("userId", token);
    editData.append(`text`, data.text);
    editData.append("image", selectedFile);
    editData.append("fileDeleted", fileDeleted);

    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API_HOST}/api/post/${post.post_id}`,
      data: editData,
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: "Bearer " + token,
      },
    })
      .then(() => {
        setPlayOnce(!playOnce);
        const showEditDOM = document.getElementById(
          `edit-container__${post.post_id}`
        );
        showEditDOM.style.display = "none";
        const editBackgroundDOM = document.getElementById(
          `edit-background__${post.post_id}`
        );
        editBackgroundDOM.style.display = "none";
        setFileDeleted(false);

        document.documentElement.style.overflow = "scroll";
        setPreview(undefined);
        setMaskImage(true);
        setSelectedFile(undefined);
        document.getElementById(`edit-file__input-${post.post_id}`).value = "";
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
  };

  const closeEdit = () => {
    const showEditDOM = document.getElementById(
      `edit-container__${post.post_id}`
    );

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
        //remettre le scroll
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
      }
    }
  };

  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [maskImage, setMaskImage] = useState(true);

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

  const deleteImage = () => {
    setMaskImage(false);
    setPreview();
    setFileDeleted(true);
  };

  let editImage;

  let postImage = post.post_imageURL;

  editImage = (
    <div className="edit-file">
      <div
        className="edit-file__close"
        onClick={() => {
          deleteImage();
        }}
      >
        x
      </div>
      <img src={postImage} alt="image du post" />
    </div>
  );
  if (maskImage === false && !preview) {
    editImage = (
      <div className="edit-file">
        <p className="edit-file__message">
          Actuellement votre post ne contient pas d'image, vous pouvez en
          ajouter une en choissant le fichier.
        </p>
      </div>
    );
  }
  if (preview) {
    editImage = (
      <div className="edit-file">
        <div
          className="edit-file__close"
          onClick={() => {
            deleteImage();
            document.getElementById(`edit-file__input-${post.post_id}`).value =
              "";
          }}
        >
          x
        </div>
        <img src={preview} alt="Prévisualisation de l'image du post" />
      </div>
    );
  }
  if (maskImage === true && !preview && !postImage) {
    editImage = (
      <div className="edit-file">
        <p className="edit-file__message">
          Actuellement votre post ne contient pas d'image, vous pouvez en
          ajouter une en choissant le fichier.
        </p>
      </div>
    );
  }

  return (
    <div className="edit-background" id={`edit-background__${post.post_id}`}>
      <div className="edit-container" id={`edit-container__${post.post_id}`}>
        <div
          className="edit-close"
          onClick={() => {
            closeEdit();
            setMaskImage(true);
          }}
        >
          x
        </div>
        <form className="edit-form" onSubmit={handleSubmit(sendEdit)}>
          <textarea
            className="edit-body"
            id={`edit-body__${post.post_id}`}
            defaultValue={post.post_body}
            {...register("text")}
          ></textarea>

          {editImage}
          <label className="edit-file">
            <div className="button">Ajouter une image</div>
            <input
              type="file"
              className="edit-file__input"
              id={`edit-file__input-${post.post_id}`}
              {...register("image")}
              onChange={onSelectFile}
            />
          </label>

          <input type="submit" className="edit-btn button"></input>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
