import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Workout, Exercise } from "../types/workout";
import { db } from "../firebase";
import { ref, get, update } from "firebase/database";
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
  const [weight, setWeight] = useState(0);
  const [rest, setRest] = useState(60);

  useEffect(() => {
    async function fetchWorkout() {
      if (!id) return;

      const snapshot = await get(ref(db, `treinos/${id}`));
      if (snapshot.exists()) {
        setWorkout({ id, ...snapshot.val() });
      } else {
        navigate("/");
      }
      setLoading(false);
    }

    fetchWorkout();
  }, [id, navigate]);

  function handleAddExercise() {
    if (!exerciseName || !substitute || !workout) return;

    const newExercise: Exercise = {
      id: uuid(),
      name: exerciseName,
      substitute,
      series,
      reps,
      weight,
      rest,
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
    await update(ref(db, `treinos/${id}`), workout);
    navigate("/treinos");
  }

  if (loading) return <p>Carregando...</p>;
  if (!workout) return null;

  return (
    <div className={styles.container}>
      <h1>Editar: {workout.name}</h1>

      <div className={styles.card}>
        <h3>Adicionar Exercício</h3>

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

        {/* ✅ UM ÚNICO CONTAINER */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Séries</label>
            <input type="number" value={series} onChange={(e) => setSeries(+e.target.value)} />
          </div>

          <div className={styles.inputGroup}>
            <label>Reps</label>
            <input type="number" value={reps} onChange={(e) => setReps(+e.target.value)} />
          </div>

          <div className={styles.inputGroup}>
            <label>Peso</label>
            <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} />
          </div>

          <div className={styles.inputGroup}>
            <label>Descanso</label>
            <input type="number" value={rest} onChange={(e) => setRest(+e.target.value)} />
          </div>
        </div>

        <button className={styles.btnSave} onClick={handleAddExercise}>
          Incluir
        </button>
      </div>

      {workout.exercises.map((ex) => (
        <div key={ex.id} className={styles.exerciseItem}>
          <strong>{ex.name}</strong>
          <button className={styles.btnRemove} onClick={() => handleRemoveExercise(ex.id)}>
            Remover
          </button>
        </div>
      ))}

      <button className={styles.btnSave} onClick={handleUpdateWorkout}>
        Salvar Alterações
      </button>
    </div>
  );
}

export default EditWorkout;
