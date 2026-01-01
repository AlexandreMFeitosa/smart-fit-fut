import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Workout, Exercise } from "../types/workout";
import { db } from "../firebase"; // Importando sua conexão Firebase
import { ref, get, update } from "firebase/database"; // Métodos do Realtime Database
import { v4 as uuid } from "uuid";
import styles from "./EditWorkout.module.css";

export function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const [exerciseName, setExerciseName] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);
  const [weight, setWeight] = useState(0); // Estado para o Peso
  const [rest, setRest] = useState(60); // Estado para o Descanso (padrão 60s)

  useEffect(() => {
    async function fetchWorkout() {
      if (!id) return;

      try {
        // BUSCANDO NO FIREBASE PELO ID
        const workoutRef = ref(db, `treinos/${id}`);
        const snapshot = await get(workoutRef);

        if (snapshot.exists()) {
          setWorkout({ id, ...snapshot.val() } as Workout);
        } else {
          // Se não achar o treino na nuvem, volta para a home
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao buscar treino:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkout();
  }, [id, navigate]);

  function handleAddExercise() {
    if (!exerciseName.trim() || !substitute.trim() || !workout) {
      alert("Preencha o nome e o substituto");
      return;
    }

    const newExercise: Exercise = {
      id: uuid(),
      name: exerciseName,
      substitute,
      series: Number(series),
      reps: Number(reps),
      weight: 0,
      rest: 60,
    };

    setWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });

    setExerciseName("");
    setSubstitute("");
    setSeries(3);
    setReps(12);
    setWeight(0);
    setRest(60);
  }

  function handleRemoveExercise(exerciseId: string) {
    if (!workout) return;
    setWorkout({
      ...workout,
      exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
    });
  }

  async function handleUpdateWorkout() {
    if (!workout || !id) return;

    try {
      const workoutRef = ref(db, `treinos/${id}`);
      // ATUALIZANDO NA NUVEM
      await update(workoutRef, {
        name: workout.name,
        exercises: workout.exercises,
      });

      alert("Treino atualizado com sucesso!");
      navigate("/treinos");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao salvar alterações.");
    }
  }

  if (loading)
    return <div className="app-container">Carregando dados da nuvem...</div>;
  if (!workout) return null;

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Editar: {workout.name}</h1>

        <div className={styles.card}>
          <h3>+ Adicionar Exercício</h3>
          <div className={styles.inputGroup}>
            <input
              placeholder="Nome do Exercício"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              placeholder="Substituto"
              value={substitute}
              onChange={(e) => setSubstitute(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div className={styles.inputGroup}>
              <label style={{ fontSize: "12px" }}>Séries</label>
              <input
                type="number"
                value={series}
                onChange={(e) => setSeries(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ fontSize: "12px" }}>Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <div className={styles.inputGroup}>
                <label style={{ fontSize: "12px" }}>Peso (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label style={{ fontSize: "12px" }}>Descanso (seg)</label>
                <input
                  type="number"
                  value={rest}
                  onChange={(e) => setRest(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <button
            className={styles.btnSave}
            onClick={handleAddExercise}
            style={{ backgroundColor: "var(--secondary)", padding: "10px" }}
          >
            Incluir na lista
          </button>
        </div>

        <h3 style={{ marginTop: "20px" }}>Exercícios Atuais</h3>
        {workout.exercises.map((ex) => (
          <div key={ex.id} className={styles.exerciseItem}>
            <div>
              <strong>{ex.name}</strong>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                {ex.series} séries x {ex.reps} reps
              </div>
            </div>
            <button
              className={styles.btnRemove}
              onClick={() => handleRemoveExercise(ex.id)}
            >
              Remover
            </button>
          </div>
        ))}

        <button className={styles.btnSave} onClick={handleUpdateWorkout}>
          Salvar Alterações do Treino
        </button>
      </div>
    </div>
  );
}

export default EditWorkout;
