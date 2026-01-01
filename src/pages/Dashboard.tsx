import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMonthlyProgress() {
      const logsRef = ref(db, "logs");
      const snapshot = await get(logsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = new Date();
        const monthPrefix = now.toISOString().slice(0, 7); // Ex: "2026-01"

        const allLogs = Object.values(data) as any[];

        // Filtra os treinos do mês atual
        const logsThisMonth = allLogs.filter(
          (log) => log.date && log.date.startsWith(monthPrefix)
        );

        // Pega o nome do último treino realizado para exibir
        if (allLogs.length > 0) {
          const sorted = allLogs.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setLastWorkout(sorted[0].workoutName);
        }

        setDone(logsThisMonth.length);
        setProgress(Math.min((logsThisMonth.length / 20) * 100, 100));
      }
    }
    fetchMonthlyProgress();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Smart Fit Fut</h1>

      <div className={styles.card}>
        <div className={styles.subtitle}>
          <span>Progresso de Janeiro</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>

        <p className={styles.progressText}>
          <strong>{done}</strong> / 20 treinos
          {lastWorkout && (
            <span className={styles.lastWorkout}>
              <br />
              Último: {lastWorkout}
            </span>
          )}
        </p>
      </div>

      <button
        className={styles.mainButton}
        onClick={() => navigate("/treinos")}
      >
        🏋️‍♂️ Meus Treinos
      </button>

      <div className={styles.buttonGrid}>
        <button
          className={styles.secondaryButton}
          onClick={() => navigate("/adicionar-treino")}
        >
          + Novo Treino
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => navigate("/historico")}
        >
          📅 Histórico
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
