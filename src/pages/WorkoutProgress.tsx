import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom"; // Importante para ler a URL
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "./WorkoutProgress.module.css";

// --- Interfaces ---
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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [allLogs, setAllLogs] = useState<WorkoutLog[]>([]);
  const [evolutionData, setEvolutionData] = useState<{ date: string; weight: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Busca Inicial: Treinos e Logs do Usuário
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar Treinos do Usuário
        const workoutsSnap = await get(ref(db, `users/${user.uid}/treinos`));
        let workoutsList: Workout[] = [];
        if (workoutsSnap.exists()) {
          workoutsList = Object.entries(workoutsSnap.val()).map(([id, w]: any) => ({
            id,
            name: w.name,
            exercises: w.exercises || [],
          }));
          setWorkouts(workoutsList);
        }

        // Buscar Logs do Usuário
        const logsSnap = await get(ref(db, `users/${user.uid}/logs`));
        if (logsSnap.exists()) {
          const logsArray = Object.values(logsSnap.val()) as WorkoutLog[];
          setAllLogs(logsArray);
        }

        // Definir seleções iniciais baseadas na URL ou no primeiro treino
        const workoutIdFromUrl = searchParams.get("workoutId");
        if (workoutIdFromUrl && workoutsList.some(w => w.id === workoutIdFromUrl)) {
          setSelectedWorkoutId(workoutIdFromUrl);
        } else if (workoutsList.length > 0) {
          setSelectedWorkoutId(workoutsList[0].id);
        }

      } catch (error) {
        console.error("Erro ao carregar dados de evolução:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, searchParams]);

  // 2. Atualiza o exercício selecionado quando o treino muda
  useEffect(() => {
    const currentWorkout = workouts.find((w) => w.id === selectedWorkoutId);
    const exerciseIdFromUrl = searchParams.get("exerciseId");

    if (currentWorkout && currentWorkout.exercises.length > 0) {
      if (exerciseIdFromUrl && currentWorkout.exercises.some(e => e.id === exerciseIdFromUrl)) {
        setSelectedExerciseId(exerciseIdFromUrl);
      } else {
        setSelectedExerciseId(currentWorkout.exercises[0].id);
      }
    } else {
      setSelectedExerciseId("");
    }
  }, [selectedWorkoutId, workouts, searchParams]);

  // 3. Filtra os dados para o gráfico
  useEffect(() => {
    if (selectedExerciseId && allLogs.length > 0) {
      const data = allLogs
        .filter((log) => log.weightsUsed && log.weightsUsed[selectedExerciseId] !== undefined)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((log) => ({
          date: new Date(log.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
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
            <label>Treino:</label>
            <select 
              value={selectedWorkoutId} 
              onChange={(e) => setSelectedWorkoutId(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecione um treino</option>
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Exercício:</label>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#10b981' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.empty}>
              {selectedExerciseId 
                ? "Ainda não há registros de peso para este exercício." 
                : "Selecione um treino para ver a evolução."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutProgress;