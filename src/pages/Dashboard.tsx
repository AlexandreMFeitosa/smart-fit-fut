import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);

  useEffect(() => {
    async function fetchMonthlyProgress() {
      const logsRef = ref(db, "logs");
      const snapshot = await get(logsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = new Date();
        const monthPrefix = now.toISOString().slice(0, 7); // Ex: "2025-12"

        // Filtra os logs que começam com o ano-mês atual
        const logsThisMonth = Object.values(data).filter((log: any) => 
          log.date && log.date.startsWith(monthPrefix)
        );

        setDone(logsThisMonth.length);
        setProgress(Math.min((logsThisMonth.length / 20) * 100, 100));
      }
    }
    fetchMonthlyProgress();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Smart Fit Fut</h1>
      
      <button className={styles.mainButton} onClick={() => navigate("/treinos")}>
        Meus Treinos
      </button>

      <div className={styles.card}>
        <p className={styles.subtitle}>Progresso do mês</p>
        
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>
        
        <p className={styles.progressText}>
          {done} / 20 treinos ({Math.round(progress)}%)
        </p>
        <hr />
      </div>

      <button className={styles.mainButton} onClick={() => navigate("/adicionar-treino")}>
        Criar Novo Treino
      </button>
    </div>
  );
}

export default Dashboard;