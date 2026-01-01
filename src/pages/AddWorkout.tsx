import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "../types/workout";
import { db } from "../firebase"; // Sua conexão configurada
import { ref, push, set } from "firebase/database"; // Imports corrigidos para Realtime
import { v4 as uuid } from "uuid";
import styles from "./AddWorkout.module.css";

export function AddWorkout() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);
  const [isSaving, setIsSaving] = useState(false);
  const [weight, setWeight] = useState(0);
  const [rest, setRest] = useState(60); // Padrão 60s

  function handleAddExercise() {
    if (!exerciseName.trim() || !substitute.trim()) {
      alert("Preencha o exercício e o substituto");
      return;
    }

    // Já deixamos o campo 'lastWeight' pronto para a Linha Amarela
    const newExercise: any = {
      id: uuid(),
      name: exerciseName,
      substitute,
      series: Number(series),
      reps: Number(reps),
      weight: Number(weight), // Salvando o peso
      rest: Number(rest), // Salvando o descanso
      lastWeight: "",
    };

    setExercises((prev) => [...prev, newExercise]);
    setExerciseName("");
    setSubstitute("");
    setWeight(0);
  }

  async function handleSaveWorkout() {
    if (!name.trim() || exercises.length === 0) {
      alert("Adicione um nome e ao menos um exercício.");
      return;
    }

    setIsSaving(true);
    try {
      // Referência para a pasta 'treinos' no Realtime Database
      const workoutsRef = ref(db, "treinos");
      const newWorkoutRef = push(workoutsRef);

      await set(newWorkoutRef, {
        name,
        exercises,
        createdAt: new Date().toISOString(),
      });

      alert("Treino salvo na nuvem!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar. Verifique o console.");
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
              <label>Descanso (segundos)</label>
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
                <span>
                  {ex.name} - {ex.series}x{ex.reps}
                </span>
                <small style={{ color: "var(--muted)" }}>{ex.substitute}</small>
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
