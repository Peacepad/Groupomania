import React from "react";
import Header from "../components/Header/Header";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";

const Signup = () => {
  let history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //Afficher un message d'erreur lorsque le serveur renvoi 401
  const [responseServer, setResponseServer] = useState("");
  const sayResponse = () => {
    setResponseServer("Le compte existe déjà");
  };

  const [classServer, setClassServer] = useState("");
  const sayClassServer = () => {
    setClassServer("invalid-feedback");
  };

  const sayGoodResponse = () => {
    setResponseServer("Le compte a été créé avec succès !");
  };

  const sayGoodClassServer = () => {
    setClassServer("valid-feedback");
  };

  const onSubmit = async (signupData) => {
    fetch(`${process.env.REACT_APP_API_HOST}/api/user/signup`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("ça marche pas");
        } else if (response.status === 402) {
          setResponseServer(
            "Le compte n'a pas pu être crée car un champ n'est pas correctement complété"
          );
          setClassServer("invalid-feedback");
        } else {
          sayGoodResponse();
          sayGoodClassServer();
          setTimeout(() => {
            history.push("/login");
          }, 3000);
        }

        return response.json();
      })
      .catch(function (error) {
        sayResponse();
        sayClassServer();
      });
  };

  return (
    <div>
      <Header />
      <main className="auth">
        <div className="logo-globe">
          <img src="./img/icon.png" alt="logo-globe" />
        </div>

       

        <form id="signup__form" onSubmit={handleSubmit(onSubmit)}>
        
          <input
            type="email"
            id="signup__email"
            placeholder="Adresse Email"
            name="email"
            {...register("email", {
              required: "Vous devez préciser une adresse email.",
            })}
          />
          {errors.email && (
            <span className="invalid-feedback">{errors.email.message}</span>
          )}
          <input
            type="text"
            id="signup__firstname"
            placeholder="Prénom"
            name="firstname"
            {...register("firstname", {
              required: "Vous devez préciser un prénom.",
              pattern: {
                value: "[A - Za - z]",
                message: "Le prénom ne respecte pas le format requis.",
              },
            })}
          />
          {errors.firstname && (
            <span className="invalid-feedback">{errors.firstname.message}</span>
          )}
          <input
            type="text"
            id="signup__lastname"
            placeholder="Nom"
            name="lastname"
            {...register("lastname", {
              required: "Vous devez préciser un nom.",
              pattern: {
                value: "[A - Za - z]",
                message: "Le nom ne respecte pas le format requis.",
              },
            })}
          />
          {errors.lastname && (
            <span className="invalid-feedback">{errors.lastname.message}</span>
          )}
          <input
            type="password"
            id="signup__password"
            placeholder="Mot de passe"
            name="password"
            {...register("password", {
              required: "Vous devez préciser un mot de passe.",
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/,
                message:
                  "Le mot de passe doit contenir 1 majuscule, 1 minuscule, 1 chiffre et 8 caractères minimum.",
              },
            })}
          />
          {errors.password && (
            <span className="invalid-feedback">{errors.password.message}</span>
          )}
          <span className={classServer}>{responseServer}</span>
          <input type="submit" id="signup__submit"></input>
        </form>
        <div className="more__auth">
          <p>
            Vous possédez déjà un compte ?{" "}
            <Link to="/" className="redlink">
              Connectez-vous.
            </Link>
          </p>
          <img src="./img/groupomania.png" alt="logo de groupomania" id="auth-logo" />
        </div>
      </main>
    </div>
  );
};

export default Signup;
