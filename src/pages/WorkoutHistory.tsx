import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./WorkoutHistory.module.css";
import { formatDate } from "../utils/formatDate";

interface WorkoutLog {
  workoutId: string;
  workoutName: string;
  date: string;
  progress: number;
  weightsUsed?: { [exerciseId: string]: number | string };
}

type LogsByDate = { [date: string]: WorkoutLog[] };

export function WorkoutHistory() {
  const [logsByDate, setLogsByDate] = useState<LogsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = today.toLocaleDateString("en-CA"); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const logsRef = ref(db, "logs");
        const snapshot = await get(logsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const logsArray = Object.values(data) as WorkoutLog[];
          const grouped = logsArray.reduce((acc: LogsByDate, log) => {
            const dateKey = log.date.split("T")[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
            return acc;
          }, {});
          setLogsByDate(grouped);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    fetchLogs();
  }, []);

  if (loading) return <div className="app-container">Carregando histórico...</div>;

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
                className={`${styles.day} ${dateKey === todayKey ? styles.today : ""} ${hasWorkout ? styles.hasWorkout : ""} ${selectedDate === dateKey ? styles.active : ""}`}
                onClick={() => hasWorkout && setSelectedDate(selectedDate === dateKey ? null : dateKey)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className={styles.details}>
            <h2 className={styles.detailsTitle}>{formatDate(selectedDate)}</h2>
            {logsByDate[selectedDate]?.map((log, idx) => (
              <div key={idx} className={styles.card}>
                <div className={styles.cardMain}>
                   <strong>✔ {log.workoutName}</strong>
                   <span className={styles.progressBadge}>{log.progress}% concluído</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;  