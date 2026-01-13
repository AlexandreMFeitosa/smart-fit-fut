import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "../types/workout";
import { db } from "../firebase";
import { ref, push } from "firebase/database";
import { v4 as uuid } from "uuid";
import styles from "./AddWorkout.module.css";
import { useAuth } from "../contexts/AuthContext";

export function AddWorkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);
  const [isSaving, setIsSaving] = useState(false);
  const [weight, setWeight] = useState(0);
  const [rest, setRest] = useState(60);

  function handleAddExercise() {
    if (!exerciseName.trim()) return;

    const newExercise: Exercise = {
      id: uuid(),
      name: exerciseName,
      substitute,
      series: Number(series),
      reps: Number(reps),
      weight: Number(weight),
      rest: Number(rest),
    };

    setExercises((prev) => [...prev, newExercise]);
    setExerciseName("");
    setSubstitute("");
    setWeight(0);
    setRest(60);
  }

  function removeExercise(id: string) {
    setExercises(exercises.filter((ex) => ex.id !== id));
  }

  async function handleSaveWorkout() {
    if (!user) return;
    if (!name.trim() || exercises.length === 0) {
      alert("Adicione um nome e ao menos um exercício.");
      return;
    }

    setIsSaving(true);
    try {
      const workoutData = {
        name: name.trim(),
        exercises: exercises,
        createdAt: new Date().toISOString(),
      };

      // 3. Referência para a pasta PRIVADA do usuário
      const userWorkoutsRef = ref(db, `users/${user.uid}/treinos`);

      // 4. Salvar no Firebase
      await push(userWorkoutsRef, workoutData);

      navigate("/treinos");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o treino. Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Novo Treino</h1>

        <div className={styles.card}>
          <div className={styles.inputGroup}>
            <label>Nome do Treino</label>
            <input
              placeholder="Ex: Treino A - Peito"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.card}>
          <h3>Adicionar Exercício</h3>
          <div className={styles.inputGroup}>
            <input
              placeholder="Exercício Principal"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              placeholder="Substituto (Obrigatório)"
              value={substitute}
              onChange={(e) => setSubstitute(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Séries</label>
              <input
                type="number"
                value={series}
                onChange={(e) => setSeries(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Peso (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Descanso (s)</label>
              <input
                type="number"
                value={rest}
                onChange={(e) => setRest(Number(e.target.value))}
              />
            </div>
          </div>

          <button className={styles.btnAddExercise} onClick={handleAddExercise}>
            + Incluir na lista
          </button>

          <ul className={styles.list}>
            {exercises.map((ex) => (
              <li key={ex.id} className={styles.exerciseItem}>
                <div>
                  <strong>{ex.name}</strong>
                  <p>
                    {ex.series}x{ex.reps} - {ex.weight}kg
                  </p>
                  <small style={{ color: "#64748b" }}>
                    Sub: {ex.substitute}
                  </small>
                </div>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className={styles.btnRemove}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          className={styles.btnSave}
          onClick={handleSaveWorkout}
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar Treino Completo"}
        </button>
      </div>
    </div>
  );
}

export default AddWorkout;