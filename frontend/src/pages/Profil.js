import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import { Avatar } from "evergreen-ui";
import { useHistory } from "react-router-dom";
import ProfilImage from "../components/Profil/ProfilImage";
import ProfilView from "../components/Profil/ProfilView";
import { useForm } from "react-hook-form";

const OtherProfil = () => {
  const params = new URL(document.location).searchParams;
  const justId = params.get("id");
  const token = localStorage.getItem("token");
  const [dataProfil, setDataProfil] = useState([]);
  const [playOnce, setPlayOnce] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const verifyUser = userData && userData.isAdmin;
  const { handleSubmit } = useForm();
  const history = useHistory();

  useEffect(() => {
    const searchUserInfo = () => {
      axios
        ({method:"GET", url:`${process.env.REACT_APP_API_HOST}/api/user/${justId}`,
        headers: {
          authorization: "Bearer " + token,
        }})
        .then((res) => {
          setDataProfil(res.data);
          setPlayOnce(false);
        });
    };
    searchUserInfo();
  }, [playOnce, justId]);

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
      <Header setPlayOnce={setPlayOnce} />

      {dataProfil[0] !== undefined &&
        dataProfil[0].user_id === userData.userId && <ProfilImage />}

      {dataProfil[0] !== undefined &&
        dataProfil[0].user_id !== userData.userId && (
          <main className="other-profil__container">
            <div className="other-profil__avatar">
              {dataProfil[0].user_imageUrl ? (
                <img src={dataProfil[0].user_imageUrl} alt="Avatar" />
              ) : (
                <div className="other-avatar">
                  <Avatar
                    className="profil-avatar__withoutUrl"
                    name={
                      dataProfil[0].firstname + " " + dataProfil[0].lastname
                    }
                    size={200}
                  />
                </div>
              )}
            </div>
          </main>
        )}

      {dataProfil[0] !== undefined &&
        (dataProfil[0].user_id === userData.userId) && (
          <ProfilView />
        )}



      {dataProfil[0] !== undefined &&
        dataProfil[0].user_id !== userData.userId  && (
          <div className="profil-info">
            <h2>Informations</h2>
            <div>Prénom: {dataProfil[0].firstname}</div>
            <div>Nom: {dataProfil[0].lastname}</div>
            <div>Email: {dataProfil[0].email}</div>
          </div>
        )}


        {dataProfil[0] !== undefined && verifyUser ==1 && dataProfil[0].user_id !== userData.userId && 
        <form id="profil-delete" onSubmit={handleSubmit(deleteUser)}>
        <input
          type="submit"
          value="Supprimer le compte"
          className="profil-delete__button"
        ></input>
      </form>}
    </div>
  );
};

export default OtherProfil;
