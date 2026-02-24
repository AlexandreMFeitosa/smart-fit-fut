import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import styles from "./DetalhesDoTreino.module.css"; // Use o CSS que criamos

export function DetalhesDoTreino() {
  const { workoutId, exerciseId } = useParams(); // Pega os IDs da URL dinâmica
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fallbackImg = "/imagens/supino-reto-barra.webp";

  useEffect(() => {
    async function loadExercise() {
      if (!user || !workoutId || !exerciseId) return;

      try {
        // Busca o treino específico do usuário
        const workoutRef = ref(db, `users/${user.uid}/treinos/${workoutId}`);
        const snapshot = await get(workoutRef);

        if (snapshot.exists()) {
          const workoutData = snapshot.val();
          // Filtra para encontrar o exercício correto dentro do array
          const found = workoutData.exercises.find(
            (e: any) => e.id === exerciseId
          );
          setExercise(found);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadExercise();
  }, [workoutId, exerciseId, user]);

  if (loading) return <div className={styles.container}>Carregando...</div>;
  if (!exercise)
    return <div className={styles.container}>Exercício não encontrado.</div>;

  // Função para lidar com links quebrados
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = "/imagens/supino-reto-barra.webp";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Voltar
        </button>
        <h1 className={styles.exerciseTitle}>{exercise.name}</h1>
      </header>
      <div style={{ display: "flex", gap: "10px", marginBottom: "-10px" }}>
        <span className={styles.badge}>{exercise.series} Séries</span>
        <span className={styles.badge}>{exercise.reps} Reps</span>
      </div>

      <div className={styles.mainImageContainer}>
        <img
          src={exercise.imageUrl || fallbackImg}
          alt={exercise.name}
          onError={(e) => (e.currentTarget.src = fallbackImg)}
          className={styles.mainImage}
        />
      </div>

      <div className={`${styles.infoCard} ${styles.personalNote}`}>
        <h3>📝 Minhas Anotações</h3>
        <p>
          {exercise.anotacao ? (
            exercise.anotacao
          ) : (
            <span className={styles.emptyNote}>
              Nenhuma anotação personalizada para este exercício.
            </span>
          )}
        </p>
      </div>

      <div className={styles.infoCard}>
        <h3>📋 EXECUÇÃO PADRÃO</h3>
        <p>{exercise.specs || "Siga as orientações do seu instrutor."}</p>
      </div>

      <div className={styles.muscleCard}>
        <h3>🔥 ATIVAÇÃO MUSCULAR</h3>
        <div className={styles.muscleImageWrapper}>
          <img
            src={exercise.muscleUrl}
            alt="Ativação Muscular"
            onError={handleImageError}
          />
        </div>
      </div>
    </div>
  );
}

export default DetalhesDoTreino;
