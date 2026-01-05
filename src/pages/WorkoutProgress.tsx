import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { LoadEvolutionChart } from "../components/LoadEvolutionChart"
import styles from "./WorkoutProgress.module.css";

interface WorkoutLog {
  date: string;
  weightsUsed?: { [exerciseId: string]: number | string };
}

export function WorkoutProgress() {
  const [evolutionData, setEvolutionData] = useState<{date: string, weight: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvolution() {
      try {
        const snapshot = await get(ref(db, "logs"));
        if (snapshot.exists()) {
          const logs = Object.values(snapshot.val()) as WorkoutLog[];
          
          // Ordena por data e extrai os pesos para o gráfico
          const formatted = logs
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(log => ({
              date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              // Pegamos o primeiro peso para o gráfico geral ou média
              weight: Number(Object.values(log.weightsUsed || {})[0]) || 0
            }))
            .filter(d => d.weight > 0);

          setEvolutionData(formatted);
        }
      } catch (err) {
        console.error("Erro ao buscar evolução:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvolution();
  }, []);

  return (
    <div className="app-container">
      <h1 className={styles.title}>Minha Evolução</h1>
      
      {loading ? (
        <p>Carregando gráfico...</p>
      ) : (
        /* USANDO SEU COMPONENTE AQUI */
        <LoadEvolutionChart data={evolutionData} />
      )}
      
      <div className={styles.infoBox}>
        <p>Este gráfico mostra a progressão das suas maiores cargas ao longo do tempo.</p>
      </div>
    </div>
  );
}

export default WorkoutProgress;