import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, remove, push, update } from "firebase/database";
import styles from "./WorkoutHistory.module.css";
import { formatDate } from "../utils/formatDate";

interface Workout {
  id: string;
  name: string;
}

interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  progress: number;
}

type LogsByDate = { [date: string]: WorkoutLog[] };

export function WorkoutHistory() {
  const [logsByDate, setLogsByDate] = useState<LogsByDate>({});
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = today.toLocaleDateString("en-CA");
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    async function fetchData() {
      try {
        // 🔹 Buscar treinos disponíveis
        const workoutsSnap = await get(ref(db, "treinos"));
        if (workoutsSnap.exists()) {
          const workoutsData = workoutsSnap.val();
          const workoutsArray: Workout[] = Object.entries(workoutsData).map(
            ([id, w]: any) => ({
              id,
              name: w.name,
            })
          );
          setWorkouts(workoutsArray);
        }

        // 🔹 Buscar histórico
        const logsSnap = await get(ref(db, "logs"));
        if (logsSnap.exists()) {
          const logsData = logsSnap.val();
          const logsArray: WorkoutLog[] = Object.entries(logsData).map(
            ([id, log]: any) => ({
              id,
              ...log,
            })
          );

          const grouped = logsArray.reduce((acc: LogsByDate, log) => {
            const dateKey = log.date.split("T")[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
            return acc;
          }, {});

          setLogsByDate(grouped);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleSelectDate(dateKey: string) {
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
    setEditingLog(null);
    setSelectedWorkoutId("");
  }

  async function handleDelete(logId: string) {
    if (!confirm("Deseja excluir este treino?")) return;

    await remove(ref(db, `logs/${logId}`));

    setLogsByDate((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((date) => {
        updated[date] = updated[date].filter((l) => l.id !== logId);
        if (updated[date].length === 0) delete updated[date];
      });
      return updated;
    });
  }

  async function handleSave(date: string) {
    if (!selectedWorkoutId) return;

    const workout = workouts.find((w) => w.id === selectedWorkoutId);
    if (!workout) return;

    // ✏️ Editar
    if (editingLog) {
      await update(ref(db, `logs/${editingLog.id}`), {
        workoutId: workout.id,
        workoutName: workout.name,
      });

      setLogsByDate((prev) => ({
        ...prev,
        [date]: prev[date].map((l) =>
          l.id === editingLog.id
            ? { ...l, workoutId: workout.id, workoutName: workout.name }
            : l
        ),
      }));
    } 
    // ➕ Adicionar
    else {
      const newLog = {
        workoutId: workout.id,
        workoutName: workout.name,
        date,
        progress: 100,
      };

      const newRef = push(ref(db, "logs"));
      await update(newRef, newLog);

      setLogsByDate((prev) => ({
        ...prev,
        [date]: [...(prev[date] || []), { id: newRef.key!, ...newLog }],
      }));
    }

    setEditingLog(null);
    setSelectedWorkoutId("");
  }

  if (loading) {
    return <div className="app-container">Carregando histórico...</div>;
  }

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Histórico de Treinos</h1>

        <div className={styles.calendar}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasWorkout = !!logsByDate[dateKey];

            return (
              <div
                key={dateKey}
                className={`${styles.day}
                  ${dateKey === todayKey ? styles.today : ""}
                  ${hasWorkout ? styles.hasWorkout : ""}
                  ${selectedDate === dateKey ? styles.active : ""}`}
                onClick={() => handleSelectDate(dateKey)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className={styles.details}>
            <h2 className={styles.detailsTitle}>
              {formatDate(selectedDate)}
            </h2>

            {logsByDate[selectedDate]?.map((log) => (
              <div key={log.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <strong>✔ {log.workoutName}</strong>
                </div>

                <div className={styles.actions}>
                  <button onClick={() => {
                    setEditingLog(log);
                    setSelectedWorkoutId(log.workoutId);
                  }}>
                    Editar
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(log.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}

            {(!logsByDate[selectedDate] || editingLog) && (
              <div className={styles.editor}>
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                >
                  <option value="">Selecione um treino</option>
                  {workouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>

                <button onClick={() => handleSave(selectedDate)}>
                  Salvar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;