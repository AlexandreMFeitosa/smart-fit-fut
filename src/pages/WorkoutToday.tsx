import { useEffect, useState } from "react";
import { db } from "../firebase"; // Importando a conexão com a nuvem
import { ref, get } from "firebase/database";
import type { WorkoutLog } from "../types/workout";
import { useNavigate } from "react-router-dom";
import styles from "./WorkoutToday.module.css";
import { formatDate } from "../utils/formatDate";

export function WorkoutToday() {
  const [todayLogs, setTodayLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTodayLogs() {
      try {
        const logsRef = ref(db, "logs");
        const snapshot = await get(logsRef);

        // CORREÇÃO DA DATA: Pega a data local YYYY-MM-DD
        const today = new Date().toLocaleDateString('en-CA');

        if (snapshot.exists()) {
          const allLogs = Object.values(snapshot.val()) as WorkoutLog[];
          // Filtra apenas os logs realizados hoje na nuvem
          const filtered = allLogs.filter((l) => l.date === today);
          setTodayLogs(filtered);
        }
      } catch (error) {
        console.error("Erro ao buscar logs de hoje:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTodayLogs();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <p>Verificando treinos de hoje...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Treino de Hoje</h1>

      {todayLogs.length === 0 ? (
        <>
          <p className={styles.subtitle}>Você ainda não treinou hoje.</p>
          <button className={styles.primary} onClick={() => navigate("/")}>
            Escolher treino
          </button>
        </>
      ) : (
        <>
          <p className={styles.subtitle}>Parabéns! Treinos concluídos hoje:</p>
          {todayLogs.map((log, index) => (
            <div key={index} className={styles.card}>
              <strong>✔ {log.workoutName}</strong>
              <p>{formatDate(log.date)}</p>
            </div>
          ))}
          <button 
            className={styles.secondary} 
            onClick={() => navigate("/")}
            style={{ marginTop: '20px' }}
          >
            Fazer outro treino
          </button>
        </>
      )}
    </div>
  );
}

export default WorkoutToday;