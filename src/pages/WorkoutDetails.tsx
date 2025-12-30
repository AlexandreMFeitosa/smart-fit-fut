import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkouts } from "../services/storage";
import type { Workout } from "../types/workout";
import styles from "./WorkoutDetails.module.css";

export function WorkoutDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const workouts = getWorkouts();
    const found = workouts.find((w) => w.id === id);

    setWorkout(found || null);
  }, [id]);

  if (!workout) {
    return (
      <div className={styles.container}>
        <p>Treino não encontrado.</p>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{workout.name}</h1>

      <ul className={styles.list}>
        {workout.exercises.map((exercise, index) => (
          <li key={index} className={styles.exercise}>
            <strong>{exercise.name}</strong>
            <span className={styles.sub}>
              Substituto: {exercise.substitute}
            </span>
          </li>
        ))}
      </ul>

      <button className={styles.secondary} onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
}

export default WorkoutDetails;
