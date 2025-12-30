import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Workout, Exercise } from "../types/workout";
import { getWorkouts, updateWorkout } from "../services/storage";
import { v4 as uuid } from "uuid";
import styles from "./EditWorkout.module.css";

export function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  
  // Estados para o formulário de novo exercício
  const [exerciseName, setExerciseName] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [series, setSeries] = useState(3);
  const [reps, setReps] = useState(12);

  useEffect(() => {
    const workouts = getWorkouts();
    const foundWorkout = workouts.find((w) => w.id === id);

    if (!foundWorkout) {
      navigate("/");
      return;
    }
    setWorkout(foundWorkout);
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
    };

    setWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });

    setExerciseName("");
    setSubstitute("");
    setSeries(3);
    setReps(12);
  }

  function handleRemoveExercise(exerciseId: string) {
    if (!workout) return;
    setWorkout({
      ...workout,
      exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
    });
  }

  if (!workout) return <div className="app-container">Carregando treino...</div>;

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
              onChange={e => setExerciseName(e.target.value)} 
            />
          </div>
          <div className={styles.inputGroup}>
            <input 
              placeholder="Substituto" 
              value={substitute} 
              onChange={e => setSubstitute(e.target.value)} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div className={styles.inputGroup}>
              <label style={{fontSize: '12px'}}>Séries</label>
              <input 
                type="number" 
                value={series} 
                onChange={e => setSeries(Number(e.target.value))} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{fontSize: '12px'}}>Reps</label>
              <input 
                type="number" 
                value={reps} 
                onChange={e => setReps(Number(e.target.value))} 
              />
            </div>
          </div>

          <button 
            className={styles.btnSave} 
            onClick={handleAddExercise} 
            style={{ backgroundColor: 'var(--secondary)', padding: '10px' }}
          >
            Incluir na lista
          </button>
        </div>

        <h3 style={{marginTop: '20px'}}>Exercícios Atuais</h3>
        {workout.exercises.length === 0 && <p>Nenhum exercício adicionado.</p>}
        {workout.exercises.map((ex) => (
          <div key={ex.id} className={styles.exerciseItem}>
            <div>
              <strong>{ex.name}</strong>
              <div style={{fontSize: '12px', color: 'var(--muted)'}}>
                {ex.series} séries x {ex.reps} reps
              </div>
            </div>
            <button className={styles.btnRemove} onClick={() => handleRemoveExercise(ex.id)}>
              Remover
            </button>
          </div>
        ))}

        <button className={styles.btnSave} onClick={() => {
          updateWorkout(workout);
          navigate("/");
        }}>
          Salvar Alterações do Treino
        </button>
      </div>
    </div>
  );
}

export default EditWorkout;