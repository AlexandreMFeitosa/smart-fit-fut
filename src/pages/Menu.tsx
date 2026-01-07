import { NavLink } from "react-router-dom";
import styles from "./Menu.module.css";

export default function Menu() {
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
        to="/treino-hoje"
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        Hoje
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
    </nav>
  );
}
