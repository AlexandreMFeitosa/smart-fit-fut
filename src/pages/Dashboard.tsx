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

  const goal = 20;
  const monthName = "Janeiro";

  useEffect(() => {
    async function fetchMonthlyProgress() {
      const logsRef = ref(db, "logs");
      const snapshot = await get(logsRef);

      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const now = new Date();
      const monthPrefix = now.toISOString().slice(0, 7); // YYYY-MM

      const allLogs = Object.values(data) as any[];

      const logsThisMonth = allLogs.filter(
        (log) => log.date && log.date.startsWith(monthPrefix)
      );

      if (allLogs.length > 0) {
        const sorted = [...allLogs].sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLastWorkout(sorted[0].workoutName);
      }

      setDone(logsThisMonth.length);
      setProgress(Math.min((logsThisMonth.length / goal) * 100, 100));
    }

    fetchMonthlyProgress();
  }, []);

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.title}>Smart Fit Fut</h1>
        <p className={styles.subtitleText}>
          Vamos manter o foco hoje 💪
        </p>
      </header>

      {/* CARD PROGRESSO */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Progresso de {monthName}</span>
          <strong>{Math.round(progress)}%</strong>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={styles.progressText}>
          <strong>{done}</strong> / {goal} treinos
        </p>

        {lastWorkout && (
          <p className={styles.lastWorkout}>
            Último treino: <strong>{lastWorkout}</strong>
          </p>
        )}
      </section>

      {/* CARD TREINO DE HOJE */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Treino de hoje</h2>

        <p className={styles.mutedText}>
          Você ainda não marcou um treino hoje
        </p>

        <button
          className={styles.primaryButton}
          onClick={() => navigate("/treinos")}
        >
          Começar treino
        </button>
      </section>

      {/* AÇÕES RÁPIDAS */}
      <section className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/adicionar-treino")}
        >
          ➕
          <span>Novo Treino</span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => navigate("/historico")}
        >
          📅
          <span>Histórico</span>
        </button>
      </section>
    </div>
  );
}

export default Dashboard;
