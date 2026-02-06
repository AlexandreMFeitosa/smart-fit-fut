  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import type { Exercise } from "../types/workout";
  import { db } from "../firebase";
  import { ref, push } from "firebase/database";
  import { v4 as uuid } from "uuid";
  import styles from "./AddWorkout.module.css";
  import { useAuth } from "../contexts/AuthContext";

  import { exerciseDatabase } from "../utils/date/date"; // importe o JSON

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

    const [suggestions, setSuggestions] = useState<typeof exerciseDatabase>([]);
    const [selectedExerciseData, setSelectedExerciseData] = useState<any>(null);

    function handleAddExercise() {
      if (!exerciseName.trim()) return;
    
      // Se o exercício não existe no seu JSON, usamos valores padrão
      const newExercise: Exercise = {
        id: uuid(),
        name: exerciseName,
        substitute: substitute || "",
        series: Number(series) || 0,
        reps: String(reps) || "0",
        weight: Number(weight) || 0,
        rest: Number(rest) || 0,
        
        imageUrl: selectedExerciseData?.imageUrl || "/imagens/padrao-treino.webp",
        muscleUrl: selectedExerciseData?.muscleUrl || "",
        specs: selectedExerciseData?.specs || "Siga a execução padrão corretamente.",
      };
    
      setExercises((prev) => [...prev, newExercise]);
    
      // Limpa tudo para o próximo
      setExerciseName("");
      setSubstitute("");
      setSeries("");
      setReps("");
      setWeight("");
      setRest(60);
      setSelectedExerciseData(null); 
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
        // 1. Limpeza rigorosa para evitar 'undefined'
        const sanitizedExercises = exercises.map(ex => ({
          id: ex.id || uuid(),
          name: ex.name || "Exercício sem nome",
          series: Number(ex.series) || 0,
          reps: String(ex.reps) || "0",
          weight: Number(ex.weight) || 0,
          rest: Number(ex.rest) || 0,
          substitute: ex.substitute || "",
          // Se não houver imagem, usa a padrão para não enviar undefined
          imageUrl: ex.imageUrl || "/imagens/supino-reto-barra.webp", 
          muscleUrl: ex.muscleUrl || "",
          specs: ex.specs || "Siga a execução padrão."
        }));
    
        const workoutData = {
          name: name.trim(),
          exercises: sanitizedExercises, // Usamos a lista limpa aqui
          createdAt: new Date().toISOString(),
        };
    
        const userWorkoutsRef = ref(db, `users/${user.uid}/treinos`);
        await push(userWorkoutsRef, workoutData);
    
        navigate("/treinos");
        
      } catch (error: any) {
        // 2. Log detalhado para você saber exatamente o que o Firebase recusou
        console.error("Erro real do Firebase:", error);
        alert(`Erro ao salvar: ${error.message}`);
        
      } finally {
        setIsSaving(false);
      }
    }

    // Função para filtrar
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setExerciseName(value);

      if (value.length > 1) {
        const filtered = exerciseDatabase
          .filter((ex) => ex.name.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5); // Limita a 5 sugestões
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    };

    // Função ao selecionar
    const handleSelect = (ex: any) => {
      setExerciseName(ex.name);
      setSelectedExerciseData(ex); // Guarda as URLs e Specs aqui
      setSuggestions([]);
    };

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

          <div className={styles.inputGroup} style={{ position: "relative" }}>
            <label>Exercício</label>
            <input
              placeholder="Ex: Supino"
              value={exerciseName}
              onChange={handleInputChange}
              autoComplete="off"
            />

            {suggestions.length > 0 && (
              <ul className={styles.suggestionList}>
                {suggestions.map((ex, index) => (
                  <li key={index} onClick={() => handleSelect(ex)}>
                    <strong>{ex.name}</strong>
                    {ex.category && <span>{ex.category}</span>}
                  </li>
                ))}
              </ul>
            )}
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
                type="text"
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
                {/* Miniatura da imagem */}
                <div className={styles.exerciseThumbnail}>
                  <img
                    src={ex.imageUrl}
                    alt={ex.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/imagens/supino-reto-barra.webp";
                    }}
                  />
                </div>

                <div className={styles.exerciseInfo}>
                  <strong>{ex.name}</strong>
                  <p>
                    {ex.series}x{ex.reps} - {ex.weight}kg | {ex.rest}s
                  </p>
                  {ex.substitute && (
                    <small className={styles.subText}>Sub: {ex.substitute}</small>
                  )}
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
    );
  }

  export default AddWorkout;
