import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import styles from "./WorkoutHistory.module.css";
import { formatDate } from "../utils/formatDate";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// DEFINIÇÃO DOS TIPOS PARA ACABAR COM OS ERROS
interface WorkoutLog {
  workoutId: string;
  workoutName: string;
  date: string;
  progress: number;
  weightsUsed?: { [exerciseId: string]: number | string };
}

type LogsByDate = {
  [date: string]: WorkoutLog[];
};

export function WorkoutHistory() {
  const [logsByDate, setLogsByDate] = useState<LogsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = today.toLocaleDateString("en-CA"); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const logsRef = ref(db, "logs");
        const snapshot = await get(logsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const logsArray = Object.values(data) as WorkoutLog[];

          const grouped = logsArray.reduce((acc: LogsByDate, log) => {
            const dateKey = log.date.split("T")[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
            return acc;
          }, {});

          setLogsByDate(grouped);
        }
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const getChartData = () => {
    const allLogs = Object.values(logsByDate)
      .flat()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return allLogs.map(log => {
      const weights = log.weightsUsed ? Object.values(log.weightsUsed) : [0];
      const firstWeight = Number(weights[0]) || 0;

      return {
        date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        weight: firstWeight,
      };
    }).filter(d => d.weight > 0);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Sincronizando evolução...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Evolução de Carga</h1>

        <div className={styles.chartCard}>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className={styles.chartLegend}>Acompanhamento de peso (kg)</p>
        </div>

        <h3 className={styles.sectionTitle}>Calendário de Treinos</h3>
        <div className={styles.calendar}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasWorkout = !!logsByDate[dateKey];

            return (
              <div
                key={dateKey}
                className={`${styles.day}
                  ${dateKey === todayKey ? styles.today : ""}
                  ${hasWorkout ? styles.hasWorkout : ""}
                  ${selectedDate === dateKey ? styles.active : ""}
                `}
                onClick={() => hasWorkout && setSelectedDate(selectedDate === dateKey ? null : dateKey)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {selectedDate && logsByDate[selectedDate] && (
          <div className={styles.details}>
            <h2 className={styles.detailsTitle}>{formatDate(selectedDate)}</h2>
            {logsByDate[selectedDate].map((log, idx) => (
              <div key={idx} className={styles.card}>
                <div className={styles.cardInfo}>
                   <strong>✔ {log.workoutName}</strong>
                   <span className={styles.badge}>{log.progress}% concluído</span>
                </div>
                {log.weightsUsed && (
                  <div className={styles.weightList}>
                    {Object.entries(log.weightsUsed).map(([id, w]) => (
                      <span key={id} className={styles.weightTag}>{w}kg</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;