import { useState, useEffect } from "react"; // Adicionado useEffect
import { useNavigate } from "react-router-dom"; // Adicionado useNavigate
import { useAuth } from "../contexts/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  // Redireciona automaticamente se o usuário já estiver logado
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // O useEffect acima cuidará do redirecionamento
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setError("E-mail ou senha incorretos.");
      else if (err.code === "auth/email-already-in-use") setError("Este e-mail já está em uso.");
      else if (err.code === "auth/weak-password") setError("A senha deve ter pelo menos 6 caracteres.");
      else setError("Ocorreu um erro ao acessar sua conta.");
    }
  }

  // Se estiver carregando o estado do Firebase, evita mostrar o formulário
  if (loading) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Smart Fit Fut</h1>
          <p>{isRegistering ? "Crie sua conta gratuita" : "Sua evolução começa aqui"}</p>
        </header>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.btnPrimary}>
            {isRegistering ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <button 
          type="button" 
          onClick={() => loginWithGoogle()} 
          className={styles.btnGoogle}
        >
          Entrar com Google
        </button>

        <footer className={styles.footer}>
          <p>
            {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Faça login" : "Cadastre-se"}
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}