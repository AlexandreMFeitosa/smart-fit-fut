import styles from "./WorkoutCard.module.css";
import type { Workout } from "../types/workout";
import { useNavigate } from "react-router-dom";

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
      <div className={styles.header}>
        <h3 className={styles.title}>{workout.name}</h3>
        <span className={styles.count}>
          {/* ✅ CORREÇÃO: Adicionado '?' e '|| 0' para evitar erro de undefined */}
          {workout.exercises?.length || 0} exercícios
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.start} onClick={onStart}>
          Iniciar
        </button>

        <button
          className={styles.editButton}
          onClick={() => navigate(`/edit-workout/${workout.id}`)}
        >
          Editar
        </button>

        <button className={styles.delete} onClick={onDelete}>
          Excluir
        </button>
      </div>
    </div>
  );
}