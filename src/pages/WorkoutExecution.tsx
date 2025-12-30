import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkouts, saveLogs } from "../services/storage";
import styles from "./WorkoutExecution.module.css";

export function WorkoutExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const workout = getWorkouts().find((w) => w.id === id);

  console.log("Treino encontrado:", workout)
  
  const [checked, setChecked] = useState<string[]>([]);

  if (!workout) {
    return (
      <div className="app-container">
        <p>Treino não encontrado.</p>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    );
  }

  function toggleExercise(exerciseId: string) {
    setChecked((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  }

  const total = workout.exercises.length;
  const completed = checked.length;
  const progress = Math.round((completed / total) * 100);

  function finishWorkout() {
    if (!workout) return;
  
    // Criamos o objeto completo conforme a interface WorkoutLog exige
    const newLog = {
      id: crypto.randomUUID(), // Gera um ID único para este log
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString().slice(0, 10),
      // Mapeamos os exercícios para salvar quais foram concluídos
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        completed: checked.includes(ex.id) // Salva se você marcou o checkbox ou não
      }))
    };
  
    saveLogs([newLog]); // Agora enviamos o objeto completo dentro da array
    navigate("/historico");
  }
  
  return (
    <div className="app-container">
      <div className={styles.container}>
        <h2 className={styles.title}>{workout.name}</h2>

        <ul className={styles.list}>
          {workout.exercises.map((exercise) => (
            <li key={exercise.id} className={styles.item}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={checked.includes(exercise.id)}
                  onChange={() => toggleExercise(exercise.id)}
                />
                <div>
                  <strong>{exercise.name}</strong>
                  <span>
                    {exercise.series} séries × {exercise.reps} reps
                  </span>
                </div>
              </label>
            </li>
          ))}
        </ul>

        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {progress}% do treino feito
          </p>
        </div>

        <button
          className={styles.primary}
          onClick={finishWorkout}
          disabled={completed === 0}
        >
          Finalizar treino
        </button>
      </div>
    </div>
  );
}

export default WorkoutExecution;
