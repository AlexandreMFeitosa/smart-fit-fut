import { NavLink } from "react-router-dom";
import styles from "./Menu.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function Menu() {
  const { user } = useAuth();

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
        to="/dieta"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Dieta
      </NavLink>

      <NavLink
        to="/config"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Ajustes
      </NavLink>
      
    </nav>
  );
}