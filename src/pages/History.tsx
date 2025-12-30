import { useEffect, useState } from "react";
import { getLogs } from "../services/storage";
import type { WorkoutLog, Workout } from "../types/workout";

export function History() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    setLogs(getLogs());
    // Replace this with the actual logic to fetch workouts
    setWorkouts([]); // Example: Replace with fetched workouts
  }, []);

  function getWorkoutName(workoutId: string) {
    const workout = workouts.find((w) => w.id === workoutId);
    return workout ? workout.name : "Você já realizou este treino hoje.";
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyCount = logs.filter((log) =>
    log.date.startsWith(currentMonth)
  ).length;

  return (
    <div>
      <h2>Histórico de Treinos</h2>
      <p>
        Esse mês você ja realizou : <strong>{monthlyCount}</strong> treinos !
      </p>

      {logs.length === 0 && <p>Nenhum treino realizado ainda.</p>}

      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            {log.date} — {getWorkoutName(log.workoutId)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default History;
