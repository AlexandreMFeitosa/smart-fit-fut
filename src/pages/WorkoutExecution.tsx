import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, push, update } from "firebase/database";
import type { Workout, Exercise } from "../types/workout";
import styles from "./WorkoutExecution.module.css";
import { useAuth } from "../contexts/AuthContext";

export function WorkoutExecution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Estados do Treino ---
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedSets, setCompletedSets] = useState<{ [exerciseId: string]: number }>({});
  const [currentWeights, setCurrentWeights] = useState<{ [exerciseId: string]: number }>({});
  
  // --- Estados dos Timers ---
  const [timer, setTimer] = useState<number | null>(null); // Timer de descanso
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);

  // --- Estados do Cronômetro Global ---
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 1. Permissão de Notificação
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Busca inicial do Treino
  useEffect(() => {
    async function fetchWorkout() {
      if (!user || !id) return;
      try {
        const workoutRef = ref(db, `users/${user.uid}/treinos/${id}`);
        const snapshot = await get(workoutRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setWorkout(data);
          // Inicializa pesos se não houver no progresso salvo
          const initialWeights: { [key: string]: number } = {};
          data.exercises.forEach((ex: Exercise) => {
            initialWeights[ex.id] = ex.weight;
          });
          setCurrentWeights((prev) => (Object.keys(prev).length === 0 ? initialWeights : prev));
        }
      } catch (err) {
        console.error("Erro ao buscar treino:", err);
      }
    }
    fetchWorkout();
  }, [id, user]);

  // 3. Recuperação de Progresso Local (LocalStorage)
  useEffect(() => {
    const savedSets = localStorage.getItem(`workout_progress_${id}`);
    const savedWeights = localStorage.getItem(`workout_weights_${id}`);
    const savedDuration = localStorage.getItem(`workout_duration_${id}`);

    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedWeights) setCurrentWeights(JSON.parse(savedWeights));
    if (savedDuration) setWorkoutDuration(Number(savedDuration));
  }, [id]);

  // 4. Persistência de Dados no LocalStorage
  useEffect(() => {
    if (Object.keys(completedSets).length > 0) {
      localStorage.setItem(`workout_progress_${id}`, JSON.stringify(completedSets));
    }
    if (Object.keys(currentWeights).length > 0) {
      localStorage.setItem(`workout_weights_${id}`, JSON.stringify(currentWeights));
    }
    localStorage.setItem(`workout_duration_${id}`, workoutDuration.toString());
  }, [completedSets, currentWeights, workoutDuration, id]);

  // 5. Lógica do Cronômetro Global do Treino
  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // 6. Lógica do Timer de Descanso (Séries)
  useEffect(() => {
    let interval: any;
    if (isActive && endTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        if (remaining !== timer) {
          setTimer(remaining);
          if (remaining <= 5 && remaining > 0) {
            const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            beep.volume = 0.8;
            beep.play().catch(() => {});
          }
        }

        if (remaining <= 0) {
          handleTimerEnd();
          clearInterval(interval);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isActive, endTime, timer]);

  // --- Funções de Controle ---

  function handleTimerEnd() {
    setIsActive(false);
    setTimer(null);
    setActiveExerciseId(null);
    setEndTime(null);

    if ("vibrate" in navigator) navigator.vibrate([800, 300, 800]);
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Alpha Fit Training", {
        body: "Descanso finalizado! Próxima série. 💪",
        icon: "/logo192.png",
        renotify: true,
        tag: "rest-timer"
      } as any);
    }
  }

  function toggleSet(exerciseId: string, setIndex: number) {
    const currentCompleted = completedSets[exerciseId] || 0;
    if (setIndex === currentCompleted) {
      const newCompleted = currentCompleted + 1;
      setCompletedSets((prev) => ({ ...prev, [exerciseId]: newCompleted }));

      const ex = workout?.exercises.find((e) => e.id === exerciseId);
      if (ex) {
        const restTime = ex.rest || 60;
        setActiveExerciseId(exerciseId);
        setTimer(restTime);
        setEndTime(Date.now() + restTime * 1000);
        setIsActive(true);
      }
    } else if (setIndex === currentCompleted - 1) {
      setCompletedSets((prev) => ({ ...prev, [exerciseId]: currentCompleted - 1 }));
    }
  }

  const calculateProgress = () => {
    if (!workout) return 0;
    const finishedExercises = workout.exercises.filter(
      (ex) => (completedSets[ex.id] || 0) === ex.series
    ).length;
    return Math.round((finishedExercises / workout.exercises.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  async function handleFinishWorkout() {
    if (!workout || !user) return;
    try {
      const logsRef = ref(db, `users/${user.uid}/logs`);
      await push(logsRef, {
        workoutId: id,
        workoutName: workout.name,
        date: new Date().toLocaleDateString("en-CA"),
        duration: workoutDuration,
        progress: calculateProgress(),
        weightsUsed: currentWeights,
      });

      const workoutRef = ref(db, `users/${user.uid}/treinos/${id}`);
      const updatedExercises = workout.exercises.map((ex) => ({
        ...ex,
        weight: currentWeights[ex.id] || ex.weight,
      }));
      await update(workoutRef, { exercises: updatedExercises });

      // Limpa dados locais
      localStorage.removeItem(`workout_progress_${id}`);
      localStorage.removeItem(`workout_weights_${id}`);
      localStorage.removeItem(`workout_duration_${id}`);
      navigate("/");
    } catch (err) {
      console.error("Erro ao finalizar:", err);
    }
  }

  // --- Renderização ---

  if (!workout) {
    return <div className={styles.container}>Carregando treino...</div>;
  }

  return (
    <div className={styles.container}>
    {/* Botão de Voltar Estruturado */}
    <button 
      className={styles.backButton} 
      onClick={() => navigate('/treinos')}
      title="Voltar para Meus Treinos"
    >
      ← Voltar
    </button>
      {/* Relógio Global Flutuante */}
      <div 
        className={`${styles.floatingTimer} ${isPaused ? styles.paused : ""}`} 
        onClick={() => setIsPaused(!isPaused)}
        title="Clique para pausar/retomar"
      >
        <span>{isPaused ? "▶️ PAUSADO" : `⏱ ${formatTime(workoutDuration)}`}</span>
      </div>

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
              <div className={styles.exerciseThumbnail}>
                <img
                  src={ex.imageUrl || "/imagens/supino-reto-barra.webp"}
                  alt={ex.name}
                  onClick={() => navigate(`/detalhes/${id}/${ex.id}`)}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "/imagens/agachamento-livre.webp";
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>

              <div className={styles.exerciseMainInfo}>
                <strong>{ex.name}</strong>
                {ex.substitute && <p className={styles.substituteText}>Sub: {ex.substitute}</p>}
                <p className={styles.seriesInfo}>{ex.series}x {ex.reps} reps</p>
              </div>

              <div className={styles.infoColumn}>
                <div className={styles.weightInputWrapper}>
                  <input
                    type="number"
                    className={styles.weightInput}
                    value={currentWeights[ex.id] ?? ex.weight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCurrentWeights((prev) => ({ ...prev, [ex.id]: val }));
                    }}
                  />
                  <span className={styles.weightUnit}>kg</span>
                </div>

                <div className={styles.actionButtons}>
                  <button className={styles.evolutionLink} onClick={() => navigate(`/detalhes/${id}/${ex.id}`)}>
                    🔍 Detalhes
                  </button>
                  <button className={styles.evolutionLink} onClick={() => navigate(`/evolucao?workoutId=${id}&exerciseId=${ex.id}`)}>
                    📈 Evolução
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