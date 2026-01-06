import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from "./LoadEvolutionChart.module.css";

export function LoadEvolutionChart({ data }: { data: any[] }) {
  return (
    <div className={styles.chartWrapper}>
      <h3 className={styles.chartTitle}>Progresso de Carga (kg)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#22c55e"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorWeight)"
            dot={{ r: 5, fill: "#fff", strokeWidth: 2, stroke: "#22c55e" }}
            // Bubble label customizado conforme sua imagem de referência
            label={(props: any) => {
              const { x, y, value } = props;
              return (
                <g transform={`translate(${x - 20},${y - 35})`}>
                  <rect width="42" height="22" rx="6" fill="#22c55e" />
                  <text x="21" y="15" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                    {`${value}kg`}
                  </text>
                </g>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}