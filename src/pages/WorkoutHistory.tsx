import { useEffect, useState } from "react";
import { getLogs } from "../services/storage";
import type { WorkoutLog } from "../types/workout";
import styles from "./WorkoutHistory.module.css";
import { formatDate } from "../utils/formatDate";

type LogsByDate = {
  [date: string]: WorkoutLog[];
};

export function WorkoutHistory() {
  const [logsByDate, setLogsByDate] = useState<LogsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const todayKey = today.toISOString().slice(0, 10);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const logs = getLogs();

    const grouped = logs.reduce((acc: LogsByDate, log) => {
      if (!acc[log.date]) acc[log.date] = [];
      acc[log.date].push(log);
      return acc;
    }, {});

    setLogsByDate(grouped);
  }, []);

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Histórico de Treinos</h1>

        {/* CALENDÁRIO */}
        <div className={styles.calendar}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;

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
                    ? setSelectedDate(
                        selectedDate === dateKey ? null : dateKey
                      )
                    : null
                }
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* DETALHES DO DIA */}
        {selectedDate && logsByDate[selectedDate] && (
          <div className={styles.details}>
            <h2>{formatDate(selectedDate)}</h2>

            {logsByDate[selectedDate].map((log) => (
              <div key={log.id} className={styles.card}>
                ✔ {log.workoutName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;