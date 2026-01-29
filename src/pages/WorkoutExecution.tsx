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

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedSets, setCompletedSets] = useState<{
    [exerciseId: string]: number;
  }>({});
  const [currentWeights, setCurrentWeights] = useState<{
    [exerciseId: string]: number;
  }>({});

  const [timer, setTimer] = useState<number | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 1. Busca inicial do treino
  // 1. Busca inicial do treino (AJUSTADO PARA PASTA DO USUÁRIO)
  useEffect(() => {
    async function fetchWorkout() {
      if (!user || !id) return; // Garante que temos o ID e o Usuário

      try {
        // Agora buscamos na subpasta do usuário logado
        const workoutRef = ref(db, `users/${user.uid}/treinos/${id}`);
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
  }, [id, user]); // Adicione 'user' como dependência

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
      localStorage.setItem(
        `workout_progress_${id}`,
        JSON.stringify(completedSets)
      );
    }
    if (Object.keys(currentWeights).length > 0) {
      localStorage.setItem(
        `workout_weights_${id}`,
        JSON.stringify(currentWeights)
      );
    }
  }, [completedSets, currentWeights, id]);

  // 1. Crie um novo estado para armazenar o timestamp final
  const [endTime, setEndTime] = useState<number | null>(null);

  // 2. Ajuste o useEffect do Timer
  useEffect(() => {
    let interval: any;

    if (isActive && endTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        if (remaining !== timer) {
          setTimer(remaining);

          // Bips curtos de aviso (5s finais)
          if (remaining <= 5 && remaining > 0) {
            const shortBeep = new Audio(
              "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
            );
            shortBeep.volume = 0.2; // Volume baixo costuma "misturar" melhor que pausar
            shortBeep.play().catch(() => {});
          }
        }

        if (remaining <= 0) {
          handleTimerEnd(); // Chamando a função correta
          setEndTime(null);
          clearInterval(interval);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isActive, endTime, timer]);

  // FUNÇÃO CORRIGIDA (Remova aquela que estava fora do componente)
  function handleTimerEnd() {
    setIsActive(false);
    setTimer(null);
    setActiveExerciseId(null);

    // 1. VERIFICAÇÃO: O app está aparecendo na tela agora?
    const isAppVisible = document.visibilityState === "visible";

    if (isAppVisible) {
      // Se o usuário está com o app aberto, toca o som normal
      const finalBeep = new Audio(
        "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
      );
      finalBeep.volume = 0.5;
      finalBeep.play().catch(() => {});
    } else {
      // Se o usuário está em OUTRO APP (ouvindo música), NÃO tocamos som para não pausar o Spotify
      // Apenas vibramos e mandamos a notificação
      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500]); // Duas vibrações longas
      }
    }

    // 2. Notificação Visual (Sempre envia, pois aparece por cima de qualquer app)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Alpha Fit Trainning", {
        body: "Vamos lá meu atleta, o descanso acabou! 💪",
        icon: "/logo192.png",
        silent: isAppVisible ? false : true, // Se o app estiver aberto, o sistema pode apitar. Se não, fica em silêncio para não parar a música.
      });
    }
  }

  function toggleSet(exerciseId: string, setIndex: number) {
    const currentCompleted = completedSets[exerciseId] || 0;

    if (setIndex + 1 === currentCompleted) {
      setCompletedSets({
        ...completedSets,
        [exerciseId]: currentCompleted - 1,
      });
    } else if (setIndex === currentCompleted) {
      setCompletedSets({
        ...completedSets,
        [exerciseId]: currentCompleted + 1,
      });

      const ex = workout?.exercises.find((e) => e.id === exerciseId);
      const restTime = ex?.rest || 60;

      setTimer(restTime);
      setEndTime(Date.now() + restTime * 1000);
      setIsActive(true);
      setActiveExerciseId(exerciseId);
    }
  }

  const handleWeightChange = (exerciseId: string, value: string) => {
    const newWeight = parseFloat(value) || 0;
    setCurrentWeights((prev) => ({ ...prev, [exerciseId]: newWeight }));
  };

  // NOVO: Função para ver evolução
  const handleSeeEvolution = (exerciseId: string) => {
    navigate(`/evolucao?workoutId=${id}&exerciseId=${exerciseId}`);
  };

  const toggleExerciseFull = (exerciseId: string, totalSeries: number) => {
    const isCurrentlyFull = (completedSets[exerciseId] || 0) === totalSeries;
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: isCurrentlyFull ? 0 : totalSeries,
    }));
  };

  const calculateProgress = () => {
    if (!workout) return 0;
    const finishedExercises = workout.exercises.filter(
      (ex) => (completedSets[ex.id] || 0) === ex.series
    ).length;
    return Math.round((finishedExercises / workout.exercises.length) * 100);
  };

  async function handleFinishWorkout() {
    // 1. Verificamos se o treino e o usuário existem
    if (!workout || !user) return;

    try {
      // 2. Referência para os LOGS (Histórico) dentro da pasta do usuário
      const logsRef = ref(db, `users/${user.uid}/logs`);

      await push(logsRef, {
        workoutId: id,
        workoutName: workout.name,
        // Salva apenas YYYY-MM-DD para facilitar a busca no Dashboard
        date: new Date().toLocaleDateString("en-CA"),
        progress: calculateProgress(),
        weightsUsed: currentWeights,
      });

      // 3. Atualização de Pesos: agora salvamos na lista de treinos PRIVADA do usuário
      // Importante: Para isso funcionar, o seu cadastro de treinos também deve salvar em `users/${user.uid}/treinos`
      const workoutRef = ref(db, `users/${user.uid}/treinos/${id}`);

      const updatedExercises = workout.exercises.map((ex) => ({
        ...ex,
        weight: currentWeights[ex.id] || ex.weight,
      }));

      await update(workoutRef, { exercises: updatedExercises });

      // Limpeza de cache local
      localStorage.removeItem(`workout_progress_${id}`);
      localStorage.removeItem(`workout_weights_${id}`);

      navigate("/");
    } catch (err) {
      console.error("Erro ao salvar treino:", err);
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
          <div
            className={styles.progressFill}
            style={{ width: `${calculateProgress()}%` }}
          />
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

                {/* EXERCÍCIO SUBSTITUTO - Aparece logo abaixo do nome */}
                {ex.substitute && (
                  <p className={styles.substituteText}>
                    Substituto: <span>{ex.substitute}</span>
                  </p>
                )}

                <p className={styles.seriesInfo}>
                  {ex.series} séries x {ex.reps} reps
                </p>
              </div>

              <div className={styles.infoColumn}>
                <div className={styles.weightColumn}>
                  <div className={styles.weightInputWrapper}>
                    <input
                      type="number"
                      className={styles.weightInput}
                      value={currentWeights[ex.id] ?? ex.weight}
                      onChange={(e) =>
                        handleWeightChange(ex.id, e.target.value)
                      }
                    />
                    <span className={styles.weightUnit}>kg</span>
                  </div>

                  {/* ATALHO PARA EVOLUÇÃO */}
                  <button
                    className={styles.evolutionLink}
                    type="button"
                    onClick={() => handleSeeEvolution(ex.id)}
                  >
                    📈 Evolução do treino
                  </button>

                  {/* ATALHO PARA VER DETALHES */}
                  <button
                    className={styles.evolutionLink}
                    type="button"
                    onClick={() => navigate("/detalhes")}
                  >
                    📈 Detalhes do treino
                  </button>
                </div>

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
        Finalizar e Salvar Cargas
      </button>
    </div>
  );
}

export default WorkoutExecution;
