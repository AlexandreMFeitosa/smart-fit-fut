import { useEffect, useState } from "react";
import { getLogs } from "../services/storage";
import type { Workout, WorkoutLog, WorkoutLogExercise } from "../types/workout";
import { useNavigate } from "react-router-dom";
import styles from "./WorkoutToday.module.css";
import { formatDate } from "../utils/formatDate";

export function WorkoutToday() {
  const [todayLogs, setTodayLogs] = useState<WorkoutLog[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const logs = getLogs();
    const today = new Date().toISOString().slice(0, 10);

    const todayLogs = logs.filter((l: WorkoutLog) => l.date === today);

    setTodayLogs(todayLogs);

   
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Treino de Hoje</h1>

      {todayLogs.length === 0 && (
        <>
          <p className={styles.subtitle}>Você ainda não treinou hoje.</p>

          <button className={styles.primary} onClick={() => navigate("/")}>
            Escolher treino
          </button>
        </>
      )}

      {todayLogs.length > 0 && (
        <>
          <p className={styles.subtitle}>Treinos concluídos hoje:</p>

          {todayLogs.map((log) => (
            <div key={log.id} className={styles.card}>
              <strong>Você realizou o {log.workoutName}</strong>
              <p>{formatDate(log.date)}</p>

            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default WorkoutToday;

export function saveWorkoutLog(
  workout: Workout,
  exercises: WorkoutLogExercise[]
) {
  const logs = getLogs();

  const today = new Date().toISOString().slice(0, 10);

  const newLog: WorkoutLog = {
    id: crypto.randomUUID(),
    workoutId: workout.id,
    workoutName: workout.name,
    date: today,
    exercises,
  };

  // ✅ SEM BLOQUEIO, SEM FILTRO
  logs.push(newLog);

  localStorage.setItem("logs", JSON.stringify(logs));
}

