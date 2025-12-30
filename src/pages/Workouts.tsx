import { useEffect, useState } from "react";
import { getWorkouts, deleteWorkout } from "../services/storage";
import type { Workout } from "../types/workout";
import { useNavigate } from "react-router-dom";
import WorkoutCard from "../components/WorkoutCard";
import styles from "./Workouts.module.css";

export function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setWorkouts(getWorkouts());
  }, []);

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este treino?")) {
      deleteWorkout(id);
      setWorkouts(getWorkouts());
    }
  }

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Meus Treinos</h1>

        {workouts.length === 0 && (
          <p className={styles.empty}>
            Nenhum treino cadastrado ainda.
          </p>
        )}

        <div className={styles.list}>
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onDelete={() => handleDelete(workout.id)}
              onEdit={() => navigate(`/edit-workout/${workout.id}`)}
              onStart={() => navigate(`/treino/${workout.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Workouts;
