import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Workout, Exercise } from "../types/workout";
import { db } from "../firebase";
import { ref, get, update } from "firebase/database";
import { v4 as uuid } from "uuid";
import styles from "./EditWorkout.module.css";
import { useAuth } from "../contexts/AuthContext";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

export function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 2. Pegar o usuário logado

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
      // 3. Só busca se houver ID e Usuário
      if (!id || !user) return;

      try {
        // 4. Caminho privado: users/UID/treinos/ID
        const snapshot = await get(ref(db, `users/${user.uid}/treinos/${id}`));

        if (snapshot.exists()) {
          setWorkout({ id, ...snapshot.val() });
        } else {
          console.error("Treino não encontrado");
          navigate("/treinos");
        }
      } catch (error) {
        console.error("Erro ao carregar treino:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkout();
  }, [id, user, navigate]);

  function handleAddExercise() {
    // Agora só trava se o NOME estiver vazio.
    // O "substitute" pode ser vazio agora.
    if (!exerciseName.trim() || !workout) {
      alert("Por favor, digite o nome do exercício.");
      return;
    }

    const newExercise: Exercise = {
      id: uuid(),
      name: exerciseName,
      substitute: substitute || "", // Se estiver vazio, salva como string vazia
      series,
      reps: reps.toString(),
      weight,
      rest,
    };

    setWorkout({
      ...workout,
      exercises: [...(workout.exercises || []), newExercise],
    });

    // Limpa os campos após adicionar
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

  // Função para mover o exercício na lista
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !workout) return;

    const items = Array.from(workout.exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWorkout({ ...workout, exercises: items });
  };

  async function handleUpdateWorkout() {
    // 5. Verificação de segurança antes de salvar
    if (!workout || !id || !user) return;

    try {
      // 6. Atualizar no caminho privado
      await update(ref(db, `users/${user.uid}/treinos/${id}`), workout);
      navigate("/treinos");
    } catch (error) {
      console.error("Erro ao atualizar treino:", error);
      alert("Erro ao salvar alterações.");
    }
  }

  if (loading)
    return (
      <div className="app-container">
        <p>Carregando...</p>
      </div>
    );
  if (!workout) return null;

  return (
    <div className="app-container">
      <div className={styles.container}>
        <h1 className={styles.title}>Editar: {workout.name}</h1>

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

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Séries</label>
              <input
                type="number"
                value={series}
                onChange={(e) => setSeries(+e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(+e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Peso</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(+e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Descanso</label>
              <input
                type="number"
                value={rest}
                onChange={(e) => setRest(+e.target.value)}
              />
            </div>
          </div>

          <button className={styles.btnAddExercise} onClick={handleAddExercise}>
            + Incluir na lista
          </button>
        </div>

        <div className={styles.card}>
          <h3>Exercícios (Arraste para reordenar)</h3>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="exercises">
              {(provided) => (
                <ul 
                  className={styles.list} 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                >
                  {workout.exercises?.map((ex, index) => (
                    <Draggable key={ex.id} draggableId={ex.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${styles.exerciseItem} ${snapshot.isDragging ? styles.dragging : ""}`}
                        >
                          <div className={styles.dragHandle}>☰</div>
                          <div className={styles.exerciseInfo}>
                            <strong>{ex.name}</strong>
                            <p>{ex.series}x{ex.reps} - {ex.weight}kg</p>
                          </div>
                          <button 
                            className={styles.btnRemove} 
                            onClick={() => handleRemoveExercise(ex.id)}
                          >
                            ✕
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <button className={styles.btnSave} onClick={handleUpdateWorkout}>
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

export default EditWorkout;
