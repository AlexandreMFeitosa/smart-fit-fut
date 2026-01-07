import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, push, update } from "firebase/database";
import type { Workout, Exercise } from "../types/workout";
import styles from "./WorkoutExecution.module.css";


export function WorkoutExecution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedSets, setCompletedSets] = useState<{ [exerciseId: string]: number }>({});
  const [currentWeights, setCurrentWeights] = useState<{ [exerciseId: string]: number }>({});
  
  const [timer, setTimer] = useState<number | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // 1. Busca inicial do treino
  useEffect(() => {
    async function fetchWorkout() {
      try {
        const workoutRef = ref(db, `treinos/${id}`);
        const snapshot = await get(workoutRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setWorkout(data);
          
          const initialWeights: { [key: string]: number } = {};
          data.exercises.forEach((ex: Exercise) => {
            initialWeights[ex.id] = ex.weight;
          });
          setCurrentWeights(initialWeights);
        }
      } catch (err) {
        console.error("Erro ao buscar treino:", err);
      }
    }
    fetchWorkout();
  }, [id]);

  // 2. RECUPERAÇÃO: LocalStorage
  useEffect(() => {
    const savedSets = localStorage.getItem(`workout_progress_${id}`);
    const savedWeights = localStorage.getItem(`workout_weights_${id}`);
    
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedWeights) setCurrentWeights(JSON.parse(savedWeights));
  }, [id]);

  // 3. PERSISTÊNCIA: LocalStorage
  useEffect(() => {
    if (Object.keys(completedSets).length > 0) {
      localStorage.setItem(`workout_progress_${id}`, JSON.stringify(completedSets));
    }
    if (Object.keys(currentWeights).length > 0) {
      localStorage.setItem(`workout_weights_${id}`, JSON.stringify(currentWeights));
    }
  }, [completedSets, currentWeights, id]);

  // Lógica do Timer
  useEffect(() => {
    let interval: any;
    if (isActive && timer !== null && timer > 0) {
      interval = setInterval(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    } else if (timer === 0) {
      handleTimerEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  function handleTimerEnd() {
    setIsActive(false);
    setTimer(null);
    setActiveExerciseId(null);
    const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    beep.play().catch(() => {});
  }

  const handleWeightChange = (exerciseId: string, value: string) => {
    const newWeight = parseFloat(value) || 0;
    setCurrentWeights(prev => ({ ...prev, [exerciseId]: newWeight }));
  };

  // NOVO: Função para ver evolução
  const handleSeeEvolution = (exerciseId: string) => {
    navigate(`/evolucao?workoutId=${id}&exerciseId=${exerciseId}`);
  };

  const toggleExerciseFull = (exerciseId: string, totalSeries: number) => {
    const isCurrentlyFull = (completedSets[exerciseId] || 0) === totalSeries;
    setCompletedSets((prev) => ({ ...prev, [exerciseId]: isCurrentlyFull ? 0 : totalSeries }));
  };

  function toggleSet(exerciseId: string, setIndex: number) {
    const currentCompleted = completedSets[exerciseId] || 0;
    if (setIndex + 1 === currentCompleted) {
      setCompletedSets({ ...completedSets, [exerciseId]: currentCompleted - 1 });
    } else if (setIndex === currentCompleted) {
      setCompletedSets({ ...completedSets, [exerciseId]: currentCompleted + 1 });
      const ex = workout?.exercises.find((e) => e.id === exerciseId);
      setTimer(ex?.rest || 60);
      setIsActive(true);
      setActiveExerciseId(exerciseId);
    }
  }

  const calculateProgress = () => {
    if (!workout) return 0;
    const finishedExercises = workout.exercises.filter(
      (ex) => (completedSets[ex.id] || 0) === ex.series
    ).length;
    return Math.round((finishedExercises / workout.exercises.length) * 100);
  };

  async function handleFinishWorkout() {
    if (!workout) return;
    try {
      const logsRef = ref(db, "logs");
      await push(logsRef, {
        workoutId: id,
        workoutName: workout.name,
        // Salva apenas YYYY-MM-DD
        date: new Date().toLocaleDateString('en-CA'), 
        progress: calculateProgress(),
        weightsUsed: currentWeights
      });

      const workoutRef = ref(db, `treinos/${id}`);
      const updatedExercises = workout.exercises.map(ex => ({
        ...ex,
        weight: currentWeights[ex.id] || ex.weight
      }));
      await update(workoutRef, { exercises: updatedExercises });

      localStorage.removeItem(`workout_progress_${id}`);
      localStorage.removeItem(`workout_weights_${id}`);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }

  if (!workout) {
    return <div className="app-container">Carregando treino...</div>;
  }

  // Agora o TypeScript sabe que, se chegou aqui, o 'workout' EXISTE e não é null.
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{workout.name}</h1>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${calculateProgress()}%` }} />
        </div>
        <p>{calculateProgress()}% concluído</p>
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
              <div className={styles.exerciseMainInfo}>
                <strong>{ex.name}</strong>
                <p>{ex.series} séries x {ex.reps} reps</p>
              </div>

              <div className={styles.infoColumn}>
                <div className={styles.weightColumn}>
                  <div className={styles.weightInputWrapper}>
                    <input 
                      type="number" 
                      className={styles.weightInput}
                      value={currentWeights[ex.id] ?? ex.weight}
                      onChange={(e) => handleWeightChange(ex.id, e.target.value)}
                    />
                    <span className={styles.weightUnit}>kg</span>
                  </div>
                  
                  {/* ATALHO PARA EVOLUÇÃO */}
                  <button 
                    className={styles.evolutionLink}
                    type="button"
                    onClick={() => handleSeeEvolution(ex.id)}
                  >
                    📈 Histórico
                  </button>
                  
                </div>

                {activeExerciseId === ex.id && timer !== null && (
                  <span className={`${styles.inlineTimer} ${timer < 10 ? styles.timerUrgent : ""}`}>
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
        Finalizar e Salvar Cargas
      </button>
    </div>
  );
}

export default WorkoutExecution;