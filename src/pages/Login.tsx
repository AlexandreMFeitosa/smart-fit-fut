import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react"; // Ícones modernos
import styles from "./Login.module.css";

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(pass);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password || (isRegistering && !name)) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Insira um e-mail válido.");
      return;
    }

    if (isRegistering) {
      if (name.trim().length < 3) {
        setError("O nome deve ter pelo menos 3 caracteres.");
        return;
      }
      if (!validatePassword(password)) {
        setError("A senha deve ter no mínimo 8 caracteres, com letras e números.");
        return;
      }
    }

    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setError("E-mail ou senha incorretos.");
      else if (err.code === "auth/email-already-in-use") setError("Este e-mail já está em uso.");
      else setError("Ocorreu um erro ao acessar sua conta.");
    }
  }

  if (loading) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Smart Fit Fut</h1>
          <p>{isRegistering ? "Crie sua conta gratuita" : "Sua evolução começa aqui"}</p>
        </header>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {isRegistering && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">Nome Completo</label>
              <input
                id="name"
                type="text"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

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
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isRegistering && (
              <small className={styles.helpText}>
                Use pelo menos 8 caracteres, letras e números.
              </small>
            )}
          </div>

          <button type="submit" className={styles.btnPrimary}>
            {isRegistering ? (
              <><UserPlus size={18} /> Cadastrar</>
            ) : (
              <><LogIn size={18} /> Entrar</>
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>ou entrar com</span>
        </div>

        <button type="button" onClick={() => loginWithGoogle()} className={styles.btnGoogle}>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA7VBMVEVHcEz/RkL/R0D+SEr/RUD/RkOwjlb/SD7/SE3/SUj/Vzb/VDf9TFb8TVeHoFb/YTD/byn8TVn/jRr/fSL/mxL/SEj+yQn/ohH/tQv+VUb/vQn/wwn+zgj9wQm3xQ39zgT6zQYwhv/7zgowhv8uhv0ek+Avhv7yzAPjywIvhv0whv7PyQHUygIth/y3yAEnivSlxwGSxgUak94fj+h5xAlgwxMLqp8NnsQVlte6xwBNwh45wC0xwDMLt28IrJgJpa0kjPCaxQEpvzsevkkWvVANumQQu18JtXkIsIgTvVYOvGALuWtJwh4OvF8OvF9ccfxCAAAAT3RSTlMAUZvT7P8T//+wiv//kAv6/mD//+V2jv//JKf//0EmxOr/rP7+MEX//x10/6eu//3+/9v///7I//+K//+KS/3/YeX//7dsnv7/////5s3tMAqBMAAAAXFJREFUeAF0jUUCwCAMwDp3d/f9/4krnVt6goQCFzheECVJFHgOPpB5RZHYIKqqyU+vGwpCXkVM07pp2zEQ8hSYiCBf1rsuFrQCvaSahHe+9wMqWHJuOD2E/lYoWsRxkUbBxcdJshY6bEQ3L6fpWmTnXXbxkBcpJTb8UBZFgUX156uyLLHI4Y+YgqL+DZqS0R7n7o4NLQX9GQwbI5tugpKI7wF5Rjd/BiNCCQZfX5BfCwyWrsnagGEYiKKpMkLqgJmZmXn/caKTzGoM7+v4IEiWPQdJ4fMhFujHCzjH7Wny6xFwMB9UKBa4KN3Tl4kh9AZYVJRbpXhVVRGX0asEXNP1a7MM0wQJA+0WFcQtyz7bcFzPAwn+8AkPwmjDcZK6WJGR75zwsCirOo7rpu0SojC2oQUeIF72/TCMY4sUKSj2wX9iXgAHwYgEoKBPizOBgx4EhwnCtxOtDnYTzn1Gnw3wzYQT3zDJrpmXYVjmpj7d/gPknlJE6eZSewAAAABJRU5ErkJggg==" alt="Google" />
          Google
        </button>

        <footer className={styles.footer}>
          <p>
            {isRegistering ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
            <span 
              className={styles.toggleMode}
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setShowPassword(false);
              }}
            >
              {isRegistering ? "Entre aqui" : "Cadastre-se agora"}
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}