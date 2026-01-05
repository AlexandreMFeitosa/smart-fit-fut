import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, push } from "firebase/database";
import type { Workout } from "../types/workout";
import styles from "./WorkoutExecution.module.css";

export function WorkoutExecution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedSets, setCompletedSets] = useState<{
    [exerciseId: string]: number;
  }>({});
  const [timer, setTimer] = useState<number | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // 1. Busca inicial do treino no Firebase
  useEffect(() => {
    async function fetchWorkout() {
      const workoutRef = ref(db, `treinos/${id}`);
      const snapshot = await get(workoutRef);
      if (snapshot.exists()) setWorkout(snapshot.val());
    }
    fetchWorkout();
  }, [id]);

  // 2. RECUPERAÇÃO: Ao carregar a página, busca o progresso salvo no celular
  useEffect(() => {
    const saved = localStorage.getItem(`workout_progress_${id}`);
    if (saved) {
      setCompletedSets(JSON.parse(saved));
    }
  }, [id]);

  // 3. PERSISTÊNCIA: Sempre que mudar uma marcação, salva no LocalStorage
  useEffect(() => {
    if (Object.keys(completedSets).length > 0) {
      localStorage.setItem(`workout_progress_${id}`, JSON.stringify(completedSets));
    }
  }, [completedSets, id]);

  // Lógica do Timer
  useEffect(() => {
    let interval: any;
    if (isActive && timer !== null && timer > 0) {
      interval = setInterval(
        () => setTimer((t) => (t !== null ? t - 1 : null)),
        1000
      );
    } else if (timer === 0) {
      handleTimerEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  function handleTimerEnd() {
    setIsActive(false);
    setTimer(null);
    setActiveExerciseId(null);

    // Proteção com try/catch para evitar tela branca no Android ao tocar som
    try {
      const beep = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      beep.play().catch(() => console.log("Áudio bloqueado pelo navegador até interação."));
    } catch (e) {
      console.error("Erro ao processar áudio:", e);
    }

    if (Notification.permission === "granted") {
      new Notification("Smart Fit Fut", {
        body: "Descanso acabou! Próxima série!",
      });
    }
  }

  const toggleExerciseFull = (exerciseId: string, totalSeries: number) => {
    const isCurrentlyFull = (completedSets[exerciseId] || 0) === totalSeries;

    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: isCurrentlyFull ? 0 : totalSeries,
    }));

    if (!isCurrentlyFull && activeExerciseId === exerciseId) {
      setIsActive(false);
      setTimer(null);
      setActiveExerciseId(null);
    }
  };

  function toggleSet(exerciseId: string, setIndex: number) {
    const currentCompleted = completedSets[exerciseId] || 0;

    if (setIndex + 1 === currentCompleted) {
      setCompletedSets({
        ...completedSets,
        [exerciseId]: currentCompleted - 1,
      });
      if (activeExerciseId === exerciseId) {
        setIsActive(false);
        setTimer(null);
        setActiveExerciseId(null);
      }
    } else if (setIndex === currentCompleted) {
      setCompletedSets({
        ...completedSets,
        [exerciseId]: currentCompleted + 1,
      });
      const ex = workout?.exercises.find((e) => e.id === exerciseId);
      setTimer(ex?.rest || 60);
      setIsActive(true);
      setActiveExerciseId(exerciseId);

      if (Notification.permission === "default")
        Notification.requestPermission();
    }
  }

  const calculateProgress = () => {
    if (!workout) return 0;
    const totalExercises = workout.exercises.length;
    const finishedExercises = workout.exercises.filter(
      (ex) => (completedSets[ex.id] || 0) === ex.series
    ).length;
    return Math.round((finishedExercises / totalExercises) * 100);
  };

  async function handleFinishWorkout() {
    if (!workout) return;
    try {
      const logsRef = ref(db, "logs");
      await push(logsRef, {
        workoutId: id,
        workoutName: workout.name,
        date: new Date().toISOString(),
        progress: calculateProgress(),
      });

      // Limpa os dados do celular apenas se salvar com sucesso no Firebase
      localStorage.removeItem(`workout_progress_${id}`);
      
      alert("Treino salvo com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao salvar o progresso.");
    }
  }

  if (!workout)
    return <div className="app-container">Carregando treino...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{workout.name}</h1>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <p>{calculateProgress()}% do treino feito</p>
      </div>

      <div className={styles.exerciseGrid}>
        {workout.exercises.map((ex) => (
          <div key={ex.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <input
                type="checkbox"
                className={styles.exerciseCheckbox}
                checked={(completedSets[ex.id] || 0) === ex.series}
                onChange={() => toggleExerciseFull(ex.id, ex.series)}
              />
              <div>
                <strong>{ex.name}</strong>
                <p>
                  {ex.series} séries x {ex.reps} reps
                </p>
              </div>

              <div className={styles.infoColumn}>
                <span className={styles.weightBadge}>{ex.weight} kg</span>
                {activeExerciseId === ex.id && timer !== null && (
                  <span
                    className={`${styles.inlineTimer} ${
                      timer < 10 ? styles.timerUrgent : ""
                    }`}
                  >
                    {timer}s
                  </span>
                )}
              </div>
            </div>

            <div className={styles.setsRow}>
              {Array.from({ length: ex.series }).map((_, i) => {
                const isFinished = i < (completedSets[ex.id] || 0);
                return (
                  <button
                    key={i}
                    className={isFinished ? styles.setDone : styles.setPending}
                    onClick={() => toggleSet(ex.id, i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.finishBtn} onClick={handleFinishWorkout}>
        Finalizar Treino
      </button>
    </div>
  );
}

export default WorkoutExecution;