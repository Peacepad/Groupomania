import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";

const Login = () => {
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Afficher un message d'erreur lorsque le serveur renvoi 401
  const [responseServer, setResponseServer] = useState("");
  const sayResponse = () => {
    setResponseServer(`Mot de ou passe ou Utilisateur incorrect`);
  };

  // Envoyer données formulaires
  const onSubmit = async (loginData) => {
    fetch(`${process.env.REACT_APP_API_HOST}/api/user/login`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Erreur de connexion");
        }
        return response.json();
      })
      .then((dataFromServer) => {
        localStorage.setItem("token", dataFromServer.token);
        localStorage.setItem("userData", dataFromServer.userData);
        history.push("/");
      })
      .catch(() => {
        sayResponse();
      });
  };

  return (
    <main className="auth">
      <div className="logo-globe">
        <img src="./img/icon.png" alt="logo-globe" />
        
      </div>
     
      

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          id="login__email"
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
          type="password"
          id="login__password"
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
        <span className="invalid-feedback">{responseServer}</span>
        <input type="submit" id="login__submit"></input>
      </form>
      <div className="more__auth">
        <p>
          Nouveau sur Groupomania?{" "}
          <Link to="/signup" className="redlink">
            Créer un compte.
          </Link>
        </p>
      </div>
      <img src="./img/groupomania.png" alt="logo de groupomania" id="auth-logo" />
    </main>
  );
};

export default Login;
