import styles from "./WorkoutCard.module.css";
import type { Workout } from "../types/workout";
import { useNavigate } from "react-router-dom";
// Dica: Se usar lucide-react ou font-awesome, substitua os emojis por ícones


type Props = {
  workout: Workout;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function WorkoutCard({
  workout,
  onStart,
  onDelete,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.info}>
          <h3 className={styles.title}>{workout.name}</h3>
          <span className={styles.count}>
            {workout.exercises?.length || 0} exercícios
          </span>
        </div>
        
        <div className={styles.adminActions}>
          <button 
            className={styles.iconButton} 
            onClick={() => navigate(`/edit-workout/${workout.id}`)}
            title="Editar"
          >
            ✏️
          </button>
          <button 
            className={`${styles.iconButton} ${styles.deleteIcon}`} 
            onClick={onDelete}
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      </div>

      <button className={styles.startFull} onClick={onStart}>
        Iniciar Treino
      </button>
    </div>
  );
}