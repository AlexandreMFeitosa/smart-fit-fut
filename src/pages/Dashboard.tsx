import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./Dashboard.module.css";
import { useAuth } from "../contexts/AuthContext";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [done, setDone] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<string | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);

  const monthName = new Date().toLocaleString("pt-BR", { month: "long" });

  const [lastDuration, setLastDuration] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        const userLogsRef = ref(db, `users/${user.uid}/logs`);
        const snapshot = await get(userLogsRef);

        if (!snapshot.exists()) {
          setDone(0);
          setLastWorkout(null);
          setTodayWorkout(null);
          return;
        }

        const data = snapshot.val();
        const now = new Date();
        const monthPrefix = now.toISOString().slice(0, 7); // Formato "YYYY-MM"
        const today = now.toLocaleDateString("en-CA");

        const allLogs = Object.values(data) as any[];

        // 1. Contador de treinos do mês atual
        const logsThisMonth = allLogs.filter(
          (log) => log.date && log.date.startsWith(monthPrefix)
        );
        setDone(logsThisMonth.length);

        // 2. Verificar se treinou hoje
        const workoutDoneToday = allLogs.find((l) => l.date === today);
        setTodayWorkout(workoutDoneToday);

        // 3. Pegar nome do último treino realizado

        if (allLogs.length > 0) {
          const sorted = [...allLogs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setLastWorkout(sorted[0].workoutName);
          setLastDuration(sorted[0].duration); // Pega a duração do banco
        }
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandContainer}>
          <img
            src="/icon-512.png"
            className={styles.logo}
            alt="Alpha Fit Logo"
          />
          <div className={styles.brandText}>
            <h1 className={styles.title}>Alpha Fit Training</h1>
            <p className={styles.subtitleText}>
              Foco total, {user?.displayName?.split(" ")[0]}! 💪
            </p>
          </div>
        </div>

        <button onClick={logout} className={styles.logoutHeaderBtn}>
          Sair
        </button>
      </header>

      {/* CARD CONTADOR MENSAL (Substituiu a Barra de Progresso) */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.monthLabel}>Frequência em {monthName}</span>
          <div className={styles.counterBadge}>
            <span className={styles.counterNumber}>{done}</span>
          </div>
        </div>

        <p className={styles.motivationText}>
          {done === 0
            ? "Mês começando, vamos pra cima! 🔥"
            : `Você completou ${done} ${
                done === 1 ? "treino" : "treinos"
              } este mês.`}
        </p>

        {lastWorkout && (
          <div className={styles.lastWorkoutDetails}>
            <p className={styles.lastWorkout}>
              Último: <strong>{lastWorkout}</strong>
            </p>
            {lastDuration && (
              <span className={styles.durationBadge}>
                ⏱ {Math.floor(lastDuration / 60)} min
              </span>
            )}
          </div>
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
            <p className={styles.mutedText}>
              Você ainda não marcou um treino hoje
            </p>
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
        <button
          className={styles.actionButton}
          onClick={() => navigate("/add-workout")}
        >
          ➕ <span>Novo Treino</span>
        </button>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/historico")}
        >
          📅 <span>Histórico</span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => navigate("/dieta")}
        >
          🍎 <span>Minha Dieta</span>
        </button>
        <button
          className={styles.actionButton}
          onClick={() => navigate("/evolucao")}
        >
          📈 <span>Evolução</span>
        </button>
      </section>
    </div>
  );
}

export default Dashboard;
