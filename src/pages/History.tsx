import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./WorkoutHistory.module.css"; // Verifique se o nome do arquivo CSS está correto como na sua pasta

export function History() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const logsRef = ref(db, "logs");
      const snapshot = await get(logsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Converte o objeto do Firebase em Array e ordena pelo mais recente
        const logsArray = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value
        })).reverse();
        
        setLogs(logsArray);
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className={styles.loadingBarContainer}>
          <div className={styles.loadingBar}></div>
          <p>Carregando histórico da nuvem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className={styles.title}>Histórico de Treinos</h1>
      
      {logs.length === 0 ? (
        <p>Nenhum treino finalizado encontrado.</p>
      ) : (
        <div className={styles.list}>
          {logs.map((log) => (
            <div key={log.id} className={styles.card}>
              <div className={styles.header}>
                <strong>{log.workoutName}</strong>
                {/* Ajuste de fuso horário manual para exibição */}
                <span>{new Date(log.date + "T12:00:00").toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className={styles.details}>
                {Object.values(log.exercises || {}).map((ex: any) => (
                  <div key={ex.id} className={styles.exerciseRow}>
                    <span>{ex.name || "Exercício"}</span>
                    <span>{ex.weight}kg | {ex.completedSeries?.length || 0} séries</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;