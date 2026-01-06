import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { useSearchParams } from "react-router-dom";
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
  const [evolutionData, setEvolutionData] = useState<{ date: string; weight: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hook para ler parâmetros da URL (ex: ?workoutId=123&exerciseId=456)
  const [searchParams] = useSearchParams();

  // 1. Busca inicial de dados (Treinos e Logs)
  useEffect(() => {
    async function fetchData() {
      try {
        const workoutsRef = ref(db, "treinos");
        const logsRef = ref(db, "logs");
        
        const [workoutsSnap, logsSnap] = await Promise.all([
          get(workoutsRef),
          get(logsRef),
        ]);
  
        if (workoutsSnap.exists()) {
          const data = workoutsSnap.val();
          const workoutsList = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name || data[key].nome || "Treino sem nome",
            exercises: (data[key].exercises || data[key].exercicios || []).map((ex: any, index: number) => ({
              id: ex.id || `ex-${index}`,
              name: ex.name || ex.nome || "Exercício sem nome",
            })),
          }));
        
          setWorkouts(workoutsList);
          
          // Lógica de seleção inicial: URL primeiro, se não, o primeiro da lista
          const workoutIdFromUrl = searchParams.get("workoutId");
          if (workoutIdFromUrl) {
            setSelectedWorkoutId(workoutIdFromUrl);
          } else if (workoutsList.length > 0) {
            setSelectedWorkoutId(workoutsList[0].id);
          }
        }
  
        if (logsSnap.exists()) {
          setAllLogs(Object.values(logsSnap.val()));
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParams]);

  // 2. Atualiza o exercício selecionado quando o treino muda
  useEffect(() => {
    const exerciseIdFromUrl = searchParams.get("exerciseId");
    const currentWorkout = workouts.find((w) => w.id === selectedWorkoutId);

    if (currentWorkout && currentWorkout.exercises.length > 0) {
      // Se viemos de um atalho (URL), usamos esse ID. Se não, pegamos o primeiro do treino.
      if (exerciseIdFromUrl && currentWorkout.exercises.some(e => e.id === exerciseIdFromUrl)) {
        setSelectedExerciseId(exerciseIdFromUrl);
      } else {
        setSelectedExerciseId(currentWorkout.exercises[0].id);
      }
    } else {
      setSelectedExerciseId("");
    }
  }, [selectedWorkoutId, workouts, searchParams]);

  // 3. Filtra os pesos para gerar o gráfico
  useEffect(() => {
    if (selectedExerciseId) {
      const data = allLogs
        .filter((log) => log.weightsUsed && log.weightsUsed[selectedExerciseId] !== undefined)
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

  const currentExercises = workouts.find((w) => w.id === selectedWorkoutId)?.exercises || [];

  if (loading) return <div className="app-container">Carregando evolução...</div>;

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
                <option key={w.id} value={w.id}>{w.name}</option>
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
                <option key={ex.id} value={ex.id}>{ex.name}</option>
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

export default WorkoutProgress;