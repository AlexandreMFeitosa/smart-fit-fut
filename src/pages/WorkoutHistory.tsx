import { useEffect, useState } from "react";
import { db } from "../firebase"; // Sua conexão nuvem
import { ref, get } from "firebase/database";
import type { WorkoutLog } from "../types/workout";
import styles from "./WorkoutHistory.module.css";
import { formatDate } from "../utils/formatDate";

type LogsByDate = {
  [date: string]: WorkoutLog[];
};

export function WorkoutHistory() {
  const [logsByDate, setLogsByDate] = useState<LogsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // CORREÇÃO DA DATA: Pegamos a data local do seu PC
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Formata hoje como YYYY-MM-DD respeitando o fuso local
  const todayKey = today.toLocaleDateString('en-CA'); // Gera "2025-12-30"
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
            if (!acc[log.date]) acc[log.date] = [];
            acc[log.date].push(log);
            return acc;
          }, {});

          setLogsByDate(grouped);
        }
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Sincronizando com a nuvem...</p>
        </div>
      </div>
    );
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
                  ${selectedDate === dateKey ? styles.active : ""}
                `}
                onClick={() =>
                  hasWorkout
                    ? setSelectedDate(selectedDate === dateKey ? null : dateKey)
                    : null
                }
              >
                {day}
              </div>
            );
          })}
        </div>

        {selectedDate && logsByDate[selectedDate] && (
          <div className={styles.details}>
            <h2>{formatDate(selectedDate)}</h2>

            {logsByDate[selectedDate].map((log, idx) => (
              <div key={idx} className={styles.card}>
                <p>✔ {log.workoutName}</p>
                {/* Opcional: mostrar exercícios realizados */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;