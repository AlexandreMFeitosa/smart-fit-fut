import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLogs } from "../services/storage";
import styles from "./Dashboard.module.css";
import type { WorkoutLog } from "../types/workout";

export function Dashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);

  useEffect(() => {
    // getLogs() agora garantidamente retorna uma array []
    const logs: WorkoutLog[] = getLogs();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const logsThisMonth = logs.filter((log) => {
      const date = new Date(log.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const totalGoal = 20; // Meta mensal
    const completedCount = logsThisMonth.length;

    setDone(completedCount);
    setProgress(Math.min((completedCount / totalGoal) * 100, 100));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Smart Fit Fut</h1>

      <button
        className={styles.mainButton}
        onClick={() => navigate("/treinos")}
      >
        Meus Treinos
      </button>

      <div className={styles.card}>
        <p className={styles.subtitle}>Progresso do mês</p>

        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={styles.progressText}>
          {done} / 20 treinos ({Math.round(progress)}%)
        </p>
        <hr />
        
      </div>
      <button
        className={styles.mainButton}
        onClick={() => navigate("/adicionar-treino")}
      >
        Criar Novo Treino
      </button>
    </div>
  );
}

export default Dashboard;