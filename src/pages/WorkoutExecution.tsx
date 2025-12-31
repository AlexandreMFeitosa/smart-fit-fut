import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, push } from "firebase/database";
import styles from "./WorkoutExecution.module.css";

interface ExerciseStatus {
  id: string;
  weight: string;
  completedSeries: number[];
}

export function WorkoutExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseStatus, setExerciseStatus] = useState<Record<string, ExerciseStatus>>({});
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    async function loadWorkout() {
      if (!id) return;
      const workoutRef = ref(db, `treinos/${id}`);
      const snapshot = await get(workoutRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setWorkout(data);
        const initialStatus: Record<string, ExerciseStatus> = {};
        data.exercises.forEach((ex: any) => {
          initialStatus[ex.id] = { id: ex.id, weight: ex.lastWeight || "", completedSeries: [] };
        });
        setExerciseStatus(initialStatus);
      }
      setLoading(false);
    }
    loadWorkout();
  }, [id]);

  useEffect(() => {
    let interval: any;
    if (timer !== null && timer > 0) {
      interval = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    } else if (timer === 0) {
      setTimer(null);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const toggleSerie = (exId: string, index: number) => {
    setExerciseStatus(prev => {
      const current = prev[exId];
      const isDone = current.completedSeries.includes(index);
      const newSeries = isDone ? current.completedSeries.filter(s => s !== index) : [...current.completedSeries, index];
      if (!isDone) setTimer(60);
      return { ...prev, [exId]: { ...current, completedSeries: newSeries } };
    });
  };

  const finishWorkout = async () => {
    if (!workout || !id) return;
    try {
      const logsRef = ref(db, 'logs');
      await push(logsRef, {
        workoutId: id,
        workoutName: workout.name,
        date: new Date().toISOString().slice(0, 10),
        exercises: exerciseStatus
      });
      alert("Treino finalizado e salvo!");
      navigate("/historico");
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="app-container">Carregando...</div>;

  return (
    <div className="app-container">
      {timer !== null && <div className={styles.timerBadge}>Descanso: {timer}s</div>}
      <div className={styles.container}>
        <h2 className={styles.title}>{workout.name}</h2>
        <ul className={styles.list}>
          {workout.exercises.map((exercise: any) => (
            <li key={exercise.id} className={styles.itemCard}>
              <div className={styles.exerciseHeader}>
                <strong>{exercise.name}</strong>
                <div className={styles.weightInput}>
                  <input type="number" value={exerciseStatus[exercise.id]?.weight} 
                    onChange={(e) => setExerciseStatus(prev => ({...prev, [exercise.id]: {...prev[exercise.id], weight: e.target.value}}))} 
                  /> kg
                </div>
              </div>
              <div className={styles.seriesContainer}>
                {Array.from({ length: Number(exercise.series) }).map((_, i) => (
                  <div key={i} className={`${styles.serieBox} ${exerciseStatus[exercise.id]?.completedSeries.includes(i) ? styles.active : ""}`}
                    onClick={() => toggleSerie(exercise.id, i)}>{i + 1}</div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <button className={styles.primary} onClick={finishWorkout}>Finalizar Treino</button>
      </div>
    </div>
  );
}

export default WorkoutExecution;