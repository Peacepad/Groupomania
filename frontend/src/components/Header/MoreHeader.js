import React from "react";
import { Link } from "react-router-dom";

const MoreHeader = ({playOnce, setPlayOnce}) => {
  // Déconnection
  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  };
  

  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <>
      <div className="header-more">
        <ul>
          <Link alt="Afficher le profil" to={`/profil/?id=${userData.userId}`} onClick={() => {if(setPlayOnce){setPlayOnce(!playOnce)}}}>
            <li>Afficher le profil</li>
          </Link>

          <Link to="/login" alt="Se déconnecter" onClick={() => signOut()}>
            <li>Se déconnecter</li>
          </Link>
        </ul>
      </div>
    </>
  );
};

export default MoreHeader;
