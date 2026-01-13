import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styles from "./Login.module.css";

export function Login() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Se o login for bem-sucedido, redireciona para a Home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Smart Fit Fut</h1>
        <p className={styles.subtitle}>Sua evolução começa aqui</p>
        
        <button onClick={loginWithGoogle} className={styles.googleBtn}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
            alt="Google" 
          />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}