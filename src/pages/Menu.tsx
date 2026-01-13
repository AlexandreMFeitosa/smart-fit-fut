import { NavLink } from "react-router-dom";
import styles from "./Menu.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function Menu() {
  const { logout, user } = useAuth();

  // Se não houver usuário logado, o menu não renderiza nada
  if (!user) return null;

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

      <button onClick={logout} className={styles.logoutButton}>
        Sair
      </button>
    </nav>
  );
}