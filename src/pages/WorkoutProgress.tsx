import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { LoadEvolutionChart } from "../components/LoadEvolutionChart";
import styles from "./WorkoutProgress.module.css";

interface Exercise {
  id: string;
  name: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutLog {
  date: string;
  weightsUsed?: { [exerciseId: string]: number | string };
}

export function WorkoutProgress() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [allLogs, setAllLogs] = useState<WorkoutLog[]>([]);
  const [evolutionData, setEvolutionData] = useState<
    { date: string; weight: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Iniciando busca no Firebase...");
        const workoutsRef = ref(db, "treinos");
        const logsRef = ref(db, "logs");
        
        const [workoutsSnap, logsSnap] = await Promise.all([
          get(workoutsRef),
          get(logsRef),
        ]);
  
        if (workoutsSnap.exists()) {
          const data = workoutsSnap.val();
          const workoutsList = Object.keys(data).map((key) => {
            const item = data[key];
            return {
              id: key,
              // Captura o nome correto: "Treino A - Peito..."
              name: item.name || item.nome || "Treino sem nome",
              // Mapeia os exercícios internos
              exercises: (item.exercises || item.exercicios || []).map((ex: any, index: number) => ({
                id: ex.id || `ex-${index}`,
                name: ex.name || ex.nome || "Exercício sem nome",
              })),
            };
          });
        
          setWorkouts(workoutsList);
          if (workoutsList.length > 0) {
            setSelectedWorkoutId(workoutsList[0].id);
          }
        } else {
          console.warn("Nenhum treino encontrado no Firebase.");
        }
  
        if (logsSnap.exists()) {
          setAllLogs(Object.values(logsSnap.val()));
        }
      } catch (err) {
        console.error("Erro crítico na busca:", err);
        alert("Erro ao conectar com o Firebase. Verifique o console.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Quando o treino selecionado mudar, atualiza o primeiro exercício da lista
  useEffect(() => {
    const currentWorkout = workouts.find((w) => w.id === selectedWorkoutId);
    if (
      currentWorkout &&
      currentWorkout.exercises &&
      currentWorkout.exercises.length > 0
    ) {
      setSelectedExerciseId(currentWorkout.exercises[0].id);
    } else {
      setSelectedExerciseId("");
    }
  }, [selectedWorkoutId, workouts]);

  // Filtra os pesos para o gráfico sempre que mudar o exercício ou logs
  useEffect(() => {
    if (selectedExerciseId) {
      const data = allLogs
        .filter(
          (log) =>
            log.weightsUsed && log.weightsUsed[selectedExerciseId] !== undefined
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((log) => ({
          date: new Date(log.date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          weight: Number(log.weightsUsed![selectedExerciseId]) || 0,
        }));
      setEvolutionData(data);
    } else {
      setEvolutionData([]);
    }
  }, [selectedExerciseId, allLogs]);

  const currentExercises =
    workouts.find((w) => w.id === selectedWorkoutId)?.exercises || [];

  if (loading)
    return <div className="app-container">Carregando evolução...</div>;

  return (
    <div className="app-container">
      <div className={styles.container}>
      <h1 className={styles.title}>Evolução de Carga</h1>

      <div className={styles.filterSection}>
        <div className={styles.field}>
          <label>Selecione o Treino:</label>
          <select
            value={selectedWorkoutId}
            onChange={(e) => setSelectedWorkoutId(e.target.value)}
            className={styles.select}
          >
            {workouts.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Selecione o Exercício:</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className={styles.select}
            disabled={currentExercises.length === 0}
          >
            {currentExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {evolutionData.length > 0 ? (
          <LoadEvolutionChart data={evolutionData} />
        ) : (
          <div className={styles.empty}>
            {selectedExerciseId
              ? "Ainda não há registros de peso para este exercício."
              : "Selecione um treino e exercício para ver a evolução."}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
