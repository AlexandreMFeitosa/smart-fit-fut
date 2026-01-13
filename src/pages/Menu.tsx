import { NavLink } from "react-router-dom";
import styles from "./Menu.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function Menu() {
  // A CHAMADA DO HOOK DEVE FICAR AQUI DENTRO!
  const { logout, user } = useAuth();

  return (
    <nav className={styles.menu}>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Início
      </NavLink>

      <NavLink
        to="/treinos"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Treinos
      </NavLink>

      <NavLink
        to="/historico"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Histórico
      </NavLink>

      <NavLink
        to="/evolucao"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Evolução
      </NavLink>

      {/* Botão de Logout só aparece se houver usuário logado */}
      {user && (
        <button onClick={logout} className={styles.logoutButton}>
          Sair
        </button>
      )}
    </nav>
  );
}