import React, { useEffect, useState, useRef } from "react";
import Navigation from "./Navigation";
import { Avatar } from "evergreen-ui";
import { Link } from "react-router-dom";
import MoreHeader from "./MoreHeader";


const Header = ({setPlayOnce}) => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData")) && JSON.parse(localStorage.getItem("userData"));

  //Verification de la connexion
  const [isLogged, setIsLogged] = useState();

  const verifyToken = () => {
    if (!token) {
      if (!userData){
      setIsLogged(false);}
    } else {
      setIsLogged(true);
    }
  };

  useEffect(() => {
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let logDiv;

  // Afficher le menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Click en dehors du menu
  const ref = useRef();

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (isMenuOpen && ref.current && !ref.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  //Affichage différent en fonction de la connexion
  if (isLogged) {
    
    
    if (userData.userImageURL !== null) {
      logDiv = (
        <div className="header-user">
          <nav className="header-avatar__container" role="button" onClick={() => setIsMenuOpen((oldState) => !oldState)} tabIndex="0" aria-label="Menu utilisateur" >
            {localStorage.getItem("userData") && (
              <img
                src={userData.userImageURL}
                alt="Votre image de profil"
                
              />
            )}
            {isMenuOpen && <MoreHeader setPlayOnce={setPlayOnce}/>}
          </nav>
        </div>
      );
    } else {
      logDiv = (
        <div className="header-user">
          <nav className="header-avatar__container"  onClick={() => setIsMenuOpen((oldState) => !oldState)} tabIndex="0" aria-label="Menu utilisateur" >
            {localStorage.getItem("userData") && (
              <Avatar color='red'
                className="header-avatar"
                name={userData.userFirstname + " " + userData.userLastname}
                size={60}
                
              />
            )}
            {isMenuOpen && <MoreHeader setPlayOnce={setPlayOnce}/>}
          </nav>
        </div>
      );
    }
  } else if(isLogged === undefined) {
    // Evite d'afficher else le temps d'un instant
  }
  else {
    logDiv = <Navigation />;
  }

  return (
    <header>
      <Link to="/" aria-label="Aller à l'accueil" tabIndex="0">
        <img src="../../img/logo.png" alt="logo groupomania" />
      </Link>
      {logDiv}
    </header>
  );
};

export default Header;
