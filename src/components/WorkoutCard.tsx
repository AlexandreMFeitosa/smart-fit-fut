import styles from "./WorkoutCard.module.css";
import type { Workout } from "../types/workout";
import { useNavigate } from "react-router-dom"; // Já estava importado, mas faltava usar

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
  const navigate = useNavigate(); // ✅ ADICIONE ESTA LINHA

  return (
    <div className={styles.card}>
      {/* TOPO */}
      <div className={styles.header}>
        <h3 className={styles.title}>{workout.name}</h3>
        <span className={styles.count}>
          {workout.exercises.length} exercícios
        </span>
      </div>

      {/* AÇÕES */}
      <div className={styles.actions}>
        <button className={styles.start} onClick={onStart}>
          Iniciar
        </button>

        <button
          className={styles.editButton}
          // ✅ Agora o navigate vai funcionar porque foi inicializado acima
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