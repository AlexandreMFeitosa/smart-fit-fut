import { db } from "../firebase";
import { ref, get, remove, push, update } from "firebase/database";
import styles from "./WorkoutHistory.module.css";
import { formatDate } from "../utils/formatDate";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";

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
  const { user } = useAuth();
  const [logsByDate, setLogsByDate] = useState<LogsByDate>({});
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  /* ===== LÓGICA DO CALENDÁRIO ===== */
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ajuste para semana começando na Segunda-feira (Seg=0, ..., Dom=6)
  const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  // Dias da semana traduzidos
  const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  /* ===== BUSCA DE DADOS (FIREBASE) ===== */
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const workoutsSnap = await get(ref(db, `users/${user.uid}/treinos`));
        if (workoutsSnap.exists()) {
          const workoutsArray: Workout[] = Object.entries(workoutsSnap.val()).map(
            ([id, w]: any) => ({ id, name: w.name })
          );
          setWorkouts(workoutsArray);
        }

        const logsSnap = await get(ref(db, `users/${user.uid}/logs`));
        if (logsSnap.exists()) {
          const logsArray: WorkoutLog[] = Object.entries(logsSnap.val()).map(
            ([id, log]: any) => ({ id, ...(log as any) })
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
  }, [user]);

  function handleSelectDate(dateKey: string) {
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
    setEditingLog(null);
    setSelectedWorkoutId("");
  }

  async function handleDelete(logId: string) {
    if (!user || !confirm("Deseja excluir este treino?")) return;
    await remove(ref(db, `users/${user.uid}/logs/${logId}`));
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
    if (!user || !selectedWorkoutId) return;
    const workout = workouts.find((w) => w.id === selectedWorkoutId);
    if (!workout) return;

    if (editingLog) {
      await update(ref(db, `users/${user.uid}/logs/${editingLog.id}`), {
        workoutId: workout.id,
        workoutName: workout.name,
      });
      setLogsByDate((prev) => ({
        ...prev,
        [date]: prev[date].map((l) =>
          l.id === editingLog.id ? { ...l, workoutId: workout.id, workoutName: workout.name } : l
        ),
      }));
    } else {
      const newLog = { workoutId: workout.id, workoutName: workout.name, date, progress: 100 };
      const newRef = push(ref(db, `users/${user.uid}/logs`));
      await update(newRef, newLog);
      setLogsByDate((prev) => ({
        ...prev,
        [date]: [...(prev[date] || []), { id: newRef.key!, ...newLog }],
      }));
    }
    setEditingLog(null);
    setSelectedWorkoutId("");
  }

  if (loading) return <div className="app-container">Carregando histórico...</div>;

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Histórico de Treinos</h1>

        <div className={styles.calendarHeader}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <span className={styles.monthLabel}>
            {currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
          </span>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
        </div>

        <div className={styles.weekdays}>
          {diasDaSemana.map((d) => <div key={d}>{d}</div>)}
        </div>

        <div className={styles.calendarGrid}>
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptyCell} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasWorkout = !!logsByDate[dateKey];

            return (
              <div
                key={dateKey}
                className={`${styles.day} ${hasWorkout ? styles.hasWorkout : ""} ${selectedDate === dateKey ? styles.active : ""}`}
                onClick={() => handleSelectDate(dateKey)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className={styles.details}>
            <h2 className={styles.detailsTitle}>{formatDate(selectedDate)}</h2>
            {logsByDate[selectedDate]?.map((log) => (
              <div key={log.id} className={styles.card}>
                <strong>✔ {log.workoutName}</strong>
                <div className={styles.actions}>
                  <button onClick={() => { setEditingLog(log); setSelectedWorkoutId(log.workoutId); }}>Editar</button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(log.id)}>Excluir</button>
                </div>
              </div>
            ))}
            {(!logsByDate[selectedDate] || editingLog) && (
              <div className={styles.editor}>
                <div className={styles.selectWrapper} ref={selectRef}>
                  <button className={styles.selectButton} onClick={() => setSelectOpen(!selectOpen)}>
                    {selectedWorkoutId ? workouts.find((w) => w.id === selectedWorkoutId)?.name : "Selecione um treino"}
                    <span>▾</span>
                  </button>
                  {selectOpen && (
                    <div className={styles.selectList}>
                      {workouts.map((w) => (
                        <div key={w.id} className={styles.selectItem} onClick={() => { setSelectedWorkoutId(w.id); setSelectOpen(false); }}>
                          {w.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className={styles.saveButton} onClick={() => handleSave(selectedDate)}>Salvar</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;