import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exercise, Workout } from "../types/workout";
import { getWorkouts, saveWorkouts } from "../services/storage";
import { v4 as uuid } from "uuid";
import styles from "./AddWorkout.module.css"; // Importando o CSS

export function AddWorkout() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);

  function handleAddExercise() {
    if (!exerciseName.trim() || !substitute.trim()) {
      alert("Preencha o exercício e o substituto");
      return;
    }

    const newExercise: Exercise = {
      id: uuid(),
      name: exerciseName,
      substitute,
      series: Number(series),
      reps: Number(reps),
    };

    setExercises((prev) => [...prev, newExercise]);
    setExerciseName("");
    setSubstitute("");
  }

  function handleSaveWorkout() {
    if (!name.trim() || exercises.length === 0) {
      alert("Dê um nome ao treino e adicione exercícios.");
      return;
    }

    const newWorkout: Workout = {
      id: uuid(),
      name,
      exercises,
    };

    const stored = getWorkouts();
    saveWorkouts([...stored, newWorkout]);
    navigate("/");
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
          </div>
          <button className={styles.btnAddExercise} onClick={handleAddExercise}>
            + Incluir na lista
          </button>

          <ul className={styles.list}>
            {exercises.map((ex) => (
              <li key={ex.id} className={styles.exerciseItem}>
                <span>{ex.name} - {ex.series}x{ex.reps}</span>
                <small style={{color: 'var(--muted)'}}>{ex.substitute}</small>
              </li>
            ))}
          </ul>
        </div>

        <button className={styles.btnSave} onClick={handleSaveWorkout}>
          Salvar Treino Completo
        </button>
      </div>
    </div>
  );
}