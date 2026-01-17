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
  const [isSaving, setIsSaving] = useState(false);

  // Alterado para string vazia para evitar o "0" automático nos inputs
  const [series, setSeries] = useState<string | number>("");
  const [reps, setReps] = useState<string | number>("");
  const [weight, setWeight] = useState<string | number>("");
  const [rest, setRest] = useState<string | number>(60);

  function handleAddExercise() {
    if (!exerciseName.trim()) return;

    const newExercise: Exercise = {
      id: uuid(),
      name: exerciseName,
      substitute,
      // Convertemos para Number apenas na hora de salvar na lista
      series: Number(series) || 0,
      reps: Number(reps) || 0,
      weight: Number(weight) || 0,
      rest: Number(rest) || 0,
    };

    setExercises((prev) => [...prev, newExercise]);
    
    // Limpa os campos para o próximo exercício
    setExerciseName("");
    setSubstitute("");
    setSeries("");
    setReps("");
    setWeight("");
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

      const userWorkoutsRef = ref(db, `users/${user.uid}/treinos`);
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
                placeholder="0"
                value={series}
                onFocus={(e) => e.target.select()} // Seleciona tudo ao clicar
                onChange={(e) => setSeries(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Reps</label>
              <input
                type="number"
                placeholder="0"
                value={reps}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Peso (kg)</label>
              <input
                type="number"
                placeholder="0"
                value={weight}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Descanso (s)</label>
              <input
                type="number"
                placeholder="60"
                value={rest}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setRest(e.target.value)}
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