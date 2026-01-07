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
  const [todayWorkout, setTodayWorkout] = useState<any>(null); // Novo estado

  const goal = 20;
  const monthName = "Janeiro";

  useEffect(() => {
    async function fetchDashboardData() {
      const logsRef = ref(db, "logs");
      const snapshot = await get(logsRef);

      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const now = new Date();
      const monthPrefix = now.toISOString().slice(0, 7); // YYYY-MM
      const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD local

      const allLogs = Object.values(data) as any[];

      // 1. Filtrar treinos do mês
      const logsThisMonth = allLogs.filter(
        (log) => log.date && log.date.startsWith(monthPrefix)
      );

      // 2. Verificar se treinou hoje
      const workoutDoneToday = allLogs.find((l) => l.date === today);
      setTodayWorkout(workoutDoneToday);

      // 3. Pegar último treino para o progresso
      if (allLogs.length > 0) {
        const sorted = [...allLogs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLastWorkout(sorted[0].workoutName);
      }

      setDone(logsThisMonth.length);
      setProgress(Math.min((logsThisMonth.length / goal) * 100, 100));
    }

    fetchDashboardData();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Smart Fit Fut</h1>
        <p className={styles.subtitleText}>Vamos manter o foco hoje 💪</p>
      </header>

      {/* CARD PROGRESSO MENSAL */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Progresso de {monthName}</span>
          <strong>{Math.round(progress)}%</strong>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
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

      {/* CARD DINÂMICO DE HOJE */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Treino de hoje</h2>

        {todayWorkout ? (
          <div className={styles.concluidoContainer}>
            <div className={styles.checkBadge}>✔</div>
            <div className={styles.concluidoInfo}>
              <strong>{todayWorkout.workoutName}</strong>
              <p>Treino do dia finalizado!</p>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.mutedText}>Você ainda não marcou um treino hoje</p>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/treinos")}
            >
              Começar treino
            </button>
          </>
        )}
      </section>

      {/* AÇÕES RÁPIDAS */}
      <section className={styles.actions}>
        <button className={styles.actionButton} onClick={() => navigate("/adicionar-treino")}>
          ➕ <span>Novo Treino</span>
        </button>
        <button className={styles.actionButton} onClick={() => navigate("/historico")}>
          📅 <span>Histórico</span>
        </button>
      </section>
    </div>
  );
}

export default Dashboard; 