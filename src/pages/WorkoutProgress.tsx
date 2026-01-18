import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, update, push, serverTimestamp } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./WorkoutProgress.module.css";

const CustomizedLabel = (props: any) => {
  const { x, y, value } = props;
  return (
    <g>
      <rect x={x - 22} y={y - 35} width={45} height={22} rx={4} fill="#10b981" />
      <text x={x} y={y - 19} fill="#fff" textAnchor="middle" fontSize={11} fontWeight="bold">
        {`${value}kg`}
      </text>
    </g>
  );
};

export function WorkoutProgress() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const workoutsSnap = await get(ref(db, `users/${user.uid}/treinos`));
      let workoutsList: any[] = [];
      if (workoutsSnap.exists()) {
        workoutsList = Object.entries(workoutsSnap.val()).map(([id, w]: any) => ({
          id,
          ...w,
          exercises: w.exercises || [],
        }));
        setWorkouts(workoutsList);
      }

      const logsSnap = await get(ref(db, `users/${user.uid}/logs`));
      if (logsSnap.exists()) {
        const logsArray = Object.values(logsSnap.val());
        setAllLogs(logsArray);
      }

      const workoutIdFromUrl = searchParams.get("workoutId");
      if (workoutIdFromUrl && workoutsList.some((w) => w.id === workoutIdFromUrl)) {
        setSelectedWorkoutId(workoutIdFromUrl);
      } else if (workoutsList.length > 0 && !selectedWorkoutId) {
        setSelectedWorkoutId(workoutsList[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  useEffect(() => {
    const currentWorkout = workouts.find((w) => w.id === selectedWorkoutId);
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const exerciseIdFromUrl = searchParams.get("exerciseId");
      setSelectedExerciseId(
        exerciseIdFromUrl && currentWorkout.exercises.some((e: any) => e.id === exerciseIdFromUrl)
          ? exerciseIdFromUrl
          : currentWorkout.exercises[0].id
      );
    }
  }, [selectedWorkoutId, workouts]);

  useEffect(() => {
    if (selectedExerciseId && allLogs.length > 0) {
      const data = allLogs
        .filter((log) => log.weightsUsed && log.weightsUsed[selectedExerciseId] !== undefined)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((log) => ({
          date: new Date(log.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          weight: Number(log.weightsUsed[selectedExerciseId]) || 0,
        }));
      setEvolutionData(data);
    }
  }, [selectedExerciseId, allLogs]);

  const handleInsertWeight = async () => {
    if (!selectedExerciseId) return alert("Selecione um exercício primeiro!");
    const newWeight = prompt("Digite a nova carga (kg):");
    if (!newWeight || isNaN(Number(newWeight))) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const newLogRef = push(ref(db, `users/${user?.uid}/logs`));
      await update(newLogRef, {
        date: today,
        timestamp: serverTimestamp(),
        weightsUsed: { [selectedExerciseId]: Number(newWeight) },
      });
      alert("Carga salva com sucesso!");
      fetchData();
    } catch (error) {
      alert("Erro ao salvar carga.");
    }
  };

  if (loading) return <div className="app-container">Carregando evolução...</div>;

  return (
    <div className="app-container">
      <div className={styles.progressContainer}>
        <h1 className={styles.title}>EVOLUÇÃO DE CARGA</h1>

        <div className={styles.filterSection}>
          <select value={selectedWorkoutId} onChange={(e) => setSelectedWorkoutId(e.target.value)} className={styles.select}>
            {workouts.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className={styles.select}>
            {(workouts.find((w) => w.id === selectedWorkoutId)?.exercises || []).map((ex: any) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.chartWrapper}>
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolutionData} margin={{ top: 40, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                <YAxis hide={true} domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip cursor={false} content={() => null} />
                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fill="url(#colorWeight)" dot={{ r: 5, fill: "#fff", stroke: "#10b981", strokeWidth: 2 }} label={<CustomizedLabel />} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.empty}>Nenhum registro encontrado.</div>
          )}
        </div>

        <div className={styles.buttonContainer}>
          <button 
            onClick={handleInsertWeight} 
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)"
            }}
          >
            <PlusCircle size={20} />
            INSERIR NOVA CARGA
          </button>
        </div>
      </div>
    </div>
  );
}