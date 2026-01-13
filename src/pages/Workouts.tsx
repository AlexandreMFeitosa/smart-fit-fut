import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, remove } from "firebase/database"; 
import { get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import WorkoutCard from "../components/WorkoutCard";
import styles from "./Workouts.module.css";
import { useAuth } from "../contexts/AuthContext";

export function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Pegar o usuário logado
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWorkouts() {
      if (!user) return; // Só busca se o usuário estiver logado

      try {
        // Mudança crucial: Buscar dentro da pasta do UID
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
          setWorkouts([]); // Se não houver treinos, lista vazia
        }
      } catch (error) {
        console.error("Erro de permissão ou busca:", error);
      } finally {
        setLoading(false); // Desativa o carregando mesmo se der erro ou estiver vazio
      }
    }

    fetchWorkouts();
  }, [user]); // Recarrega se o usuário mudar

  if (loading) return <div>Carregando treinos...</div>;

  async function handleDelete(id: string) {
    if (confirm("Deseja excluir este treino da nuvem?")) {
      try {
        await remove(ref(db, `treinos/${id}`));
        alert("Treino excluído!");
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
        </div>
      </div>
    </div>
  );
}

export default Workouts;