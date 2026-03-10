import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, remove, get, push } from "firebase/database"; 
import { useNavigate } from "react-router-dom";
import WorkoutCard from "../components/WorkoutCard";
import styles from "./Workouts.module.css";
import { useAuth } from "../contexts/AuthContext";

// 1. Definição dos modelos prontos
const modelosProntos: any = {
  "Adaptação (Iniciante)": [
    { name: "Leg Press 45", series: 3, reps: "15", weight: 20, rest: 60, imageUrl: "/imagens/leg-press.webp", specs: "Foco na amplitude." },
    { name: "Supino Máquina", series: 3, reps: "12", weight: 10, rest: 60, imageUrl: "/imagens/supino-reto-barra.webp", specs: "Controle o movimento." },
    { name: "Puxada Frente", series: 3, reps: "12", weight: 20, rest: 60, imageUrl: "/imagens/puxada-frente.webp", specs: "Não balance o tronco." }
  ],
  "Hipertrofia A (Push)": [
    { name: "Supino Reto Barra", series: 4, reps: "10", weight: 40, rest: 90, imageUrl: "/imagens/supino-reto-barra.webp", specs: "Barra até o peito." },
    { name: "Desenvolvimento Halter", series: 3, reps: "12", weight: 12, rest: 60, imageUrl: "/imagens/desenvolvimento-ombro.webp", specs: "Coluna bem apoiada." }
  ],
  "Treino Funcional": [
    { name: "Agachamento Livre", series: 4, reps: "20", weight: 0, rest: 45, imageUrl: "/imagens/agachamento.webp", specs: "Mantenha o ritmo." },
    { name: "Prancha Abdominal", series: 3, reps: "45s", weight: 0, rest: 30, imageUrl: "/imagens/prancha.webp", specs: "Contraia o abdômen." }
  ]
};

const sugestoes = [
  { nome: "Adaptação (Iniciante)", cor: "#22c55e", desc: "Ideal para quem está começando agora." },
  { nome: "Hipertrofia A (Push)", cor: "#3b82f6", desc: "Foco em Peito, Ombro e Tríceps." },
  { nome: "Treino Funcional", cor: "#f59e0b", desc: "Queima calórica e condicionamento." }
];

export function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function fetchWorkouts() {
    if (!user) return;
    try {
      const workoutsRef = ref(db, `users/${user.uid}/treinos`);
      const snapshot = await get(workoutsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const workoutsList = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));
        setWorkouts(workoutsList);
      } else {
        setWorkouts([]);
      }
    } catch (error) {
      console.error("Erro ao buscar treinos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  // 2. Função para aplicar o modelo no banco de dados
  const aplicarModelo = async (nomeModelo: string) => {
    if (!user) return;
    const confirmacao = window.confirm(`Deseja adicionar o modelo "${nomeModelo}" aos seus treinos?`);
    
    if (confirmacao) {
      try {
        const novoTreino = {
          name: nomeModelo,
          exercises: modelosProntos[nomeModelo],
          createdAt: new Date().toISOString(),
        };
        const userWorkoutsRef = ref(db, `users/${user.uid}/treinos`);
        await push(userWorkoutsRef, novoTreino);
        alert("Treino adicionado!");
        fetchWorkouts(); // Recarrega a lista
      } catch (error) {
        alert("Erro ao salvar modelo.");
      }
    }
  };

  async function handleDelete(id: string) {
    if (!user) return;
    if (confirm("Deseja excluir este treino da nuvem?")) {
      try {
        await remove(ref(db, `users/${user.uid}/treinos/${id}`));
        setWorkouts(prev => prev.filter(w => w.id !== id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  }

  if (loading) return <div className="app-container">Carregando treinos...</div>;

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Meus Treinos</h1>

        {/* 3. Renderização Condicional: Se não tem treinos, mostra sugestões */}
        {workouts.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyText}>Você ainda não possui treinos cadastrados.</p>
            <p className={styles.subtitle}>Escolha um pronto para começar ou Manualmente:</p>

            <button onClick={() => navigate("/adicionar-treino")} className={styles.btnCreate}>
              Criar Treino Manualmente
            </button>

            <div className={styles.divisor}>OU</div>

            
            <div className={styles.sugestoesGrid}>
              {sugestoes.map((sug, i) => (
                <button 
                  key={i} 
                  className={styles.sugestaoCard} 
                  onClick={() => aplicarModelo(sug.nome)}
                  style={{ borderLeftColor: sug.cor }}
                >
                  <h4>{sug.nome}</h4>
                  <p>{sug.desc}</p>
                  <span>+ Adicionar aos meus treinos</span>
                </button>
              ))}
            </div>

            
          </div>
        ) : (
          <div className={styles.list}>
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onDelete={() => handleDelete(workout.id)}
                onEdit={() => navigate(`/edit-workout/${workout.id}`)}
                onStart={() => navigate(`/treino/${workout.id}`)}
              />
            ))}
            <button onClick={() => navigate("/add-workout")} className={styles.btnAddFloating}>
              + Novo Treino
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Workouts;