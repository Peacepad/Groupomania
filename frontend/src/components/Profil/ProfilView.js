import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useHistory } from "react-router-dom";

const ProfilView = () => {
  const history = useHistory();
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    let formData = new FormData();
    formData.append("firstname", data.firstname);
    formData.append("lastname", data.lastname);
    formData.append("email", data.email);

    // controle des champs du formulaire

    let firstnameRegExp = /^[a-z '-]+$/i;
    let lastnameRegExp = /^[a-z '-]+$/i;
    let emailRegExp = /.+\@.+\..+/; //eslint-disable-line

    if (
      firstnameRegExp.test(data.firstname) &&
      lastnameRegExp.test(data.lastname) &&
      emailRegExp.test(data.email)
    ) {
      axios({
        method: "PUT",
        url: `${process.env.REACT_APP_API_HOST}/api/user/${userData.userId}`,
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: "Bearer " + token,
        },
        data: formData,
      })
        .then((res) => {
          let userData = JSON.parse(localStorage.getItem("userData"));
          userData.userFirstname = res.data.userFirstname;
          userData.userLastname = res.data.userLastname;
          userData.userEmail = res.data.userEmail;
          localStorage.setItem("userData", JSON.stringify(userData));
          setIsSuccessfullySubmitted(true);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      if (!firstnameRegExp.test(data.firstname)) {
        document.getElementById("profil-firstname").classList.add("shake");
        setTimeout(() => {
          document.getElementById("profil-firstname").classList.remove("shake");
        }, 1000);
      }
      if (!lastnameRegExp.test(data.lastname)) {
        document.getElementById("profil-lastname").classList.add("shake");
        setTimeout(() => {
          document.getElementById("profil-lastname").classList.remove("shake");
        }, 1000);
      }
      if (!emailRegExp.test(data.email)) {
        document.getElementById("profil-email").classList.add("shake");
        setTimeout(() => {
          document.getElementById("profil-email").classList.remove("shake");
        }, 1000);
      }
    }
  };

  const deleteUser = () => {
    const params = new URL(document.location).searchParams;
    const justId = params.get("id");
    axios({
      method: "delete",
      url: `${process.env.REACT_APP_API_HOST}/api/user/${justId}`,
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: "Bearer " + token,
      },
    })
      .then(() => {
        if (justId == userData.userId) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          history.push("/login");
        } else {
          history.push("/");
        }
      })
      .catch(console.log("erreur"));
  };

  return (
    <div>
      <div className="profil-info">
        <h2>Vos informations</h2>
        <form className="profil-edit" onSubmit={handleSubmit(onSubmit)}>
          <div className="profil-edit__label">
            <label>
              Prénom :{" "}
              <input
                id="profil-firstname"
                type="text"
                defaultValue={userData.userFirstname}
                {...register("firstname")}
              />
            </label>
            <label>
              Nom :{" "}
              <input
                type="text"
                id="profil-lastname"
                defaultValue={userData.userLastname}
                {...register("lastname")}
              />
            </label>

            <label>
              Email :{" "}
              <input
                type="text"
                id="profil-email"
                defaultValue={userData.userEmail}
                {...register("email")}
              />
            </label>
          </div>

          <input
            type="submit"
            className="profil-submit"
            value="Modifier"
          ></input>
          {isSuccessfullySubmitted === true && (
            <div className="success">
              Le profil a été modifé avec succès{" "}
              <FontAwesomeIcon icon={faCheck} />
            </div>
          )}
        </form>
      </div>

      <form id="profil-delete" onSubmit={handleSubmit(deleteUser)}>
        <input
          type="submit"
          value="Supprimer le compte"
          className="profil-delete__button"
        ></input>
      </form>
    </div>
  );
};

export default ProfilView;
