import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid} from 'recharts';
import styles from "./LoadEvolutionChart.module.css";

interface ChartData {
  date: string;
  weight: number;
}

export function LoadEvolutionChart({ data }: { data: ChartData[] }) {
  return (
    <div className={styles.chartWrapper}>
      <h3 className={styles.chartTitle}>Progressão de Carga (kg)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {/* Gradiente sutil no fundo */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }} 
          />

          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
          />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#22c55e" // Verde Smart Fit
            strokeWidth={4}
            dot={{ r: 6, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 8, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}