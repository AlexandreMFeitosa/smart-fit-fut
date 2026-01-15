import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./Dashboard.module.css";
import { useAuth } from "../contexts/AuthContext";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<string | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<any>(null); // Novo estado

  const goal = 20;
  const monthName = "Janeiro";

  useEffect(() => {
    async function fetchDashboardData() {
      // 3. Só buscar dados se o usuário estiver carregado
      if (!user) return;

      // 4. Mudar o caminho para a "pasta" exclusiva do usuário
      const userLogsRef = ref(db, `users/${user.uid}/logs`);
      const snapshot = await get(userLogsRef);

      if (!user) {
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            Carregando perfil...
          </div>
        );
      }

      if (!snapshot.exists()) {
        // Se for um usuário novo sem treinos, resetamos os estados
        setDone(0);
        setProgress(0);
        setLastWorkout(null);
        setTodayWorkout(null);
        return;
      }

      const data = snapshot.val();
      const now = new Date();
      const monthPrefix = now.toISOString().slice(0, 7);
      const today = now.toLocaleDateString("en-CA");

      const allLogs = Object.values(data) as any[];

      // 1. Filtrar treinos do mês (agora apenas do usuário logado)
      const logsThisMonth = allLogs.filter(
        (log) => log.date && log.date.startsWith(monthPrefix)
      );

      // 2. Verificar se treinou hoje
      const workoutDoneToday = allLogs.find((l) => l.date === today);
      setTodayWorkout(workoutDoneToday);

      // 3. Pegar último treino
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
  }, [user]); // 5. Dependência do user para recarregar se o login mudar

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
          onClick={() => navigate("/adicionar-treino")}
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
