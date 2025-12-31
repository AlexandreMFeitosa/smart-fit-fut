import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, remove } from "firebase/database"; 
import type { Workout } from "../types/workout";
import { useNavigate } from "react-router-dom";
import WorkoutCard from "../components/WorkoutCard";
import styles from "./Workouts.module.css";

export function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const workoutsRef = ref(db, "treinos");
    
    // onValue escuta mudanças em tempo real no Realtime Database
    const unsubscribe = onValue(workoutsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const workoutList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })) as Workout[];
        setWorkouts(workoutList);
      } else {
        setWorkouts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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