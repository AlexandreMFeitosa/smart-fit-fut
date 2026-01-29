import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, get, set } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./EditarDieta.module.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

// Interface para manter a consistência dos dados
interface Refeicao {
  hora: string;
  nome: string;
  itens: string;
}

export function EditarDieta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega a dieta existente do Firebase ao abrir a página
  useEffect(() => {
    if (!user) return;

    async function carregarDados() {
      try {
        const snapshot = await get(ref(db, `users/${user?.uid}/dieta`));
        if (snapshot.exists()) {
          setRefeicoes(snapshot.val());
        }
      } catch (error) {
        console.error("Erro ao buscar dieta:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user]);

  // Adiciona um novo card de refeição vazio
  const adicionarRefeicao = () => {
    setRefeicoes([...refeicoes, { hora: "08:00", nome: "", itens: "" }]);
  };

  // Remove uma refeição específica
  const removerRefeicao = (index: number) => {
    setRefeicoes(refeicoes.filter((_, i) => i !== index));
  };

  // Salva a lista completa no Firebase
  const salvarDieta = async () => {
    if (!user) return;
    try {
      await set(ref(db, `users/${user.uid}/dieta`), refeicoes);
      alert("Dieta salva com sucesso! 💪");
      navigate("/dieta");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar a dieta.");
    }
  };

  if (loading) return <div className="app-container"><p>Carregando...</p></div>;

  // Função para lidar com o fim do arraste
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(refeicoes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRefeicoes(items);
  };

  return (
    <div className="app-container">
      <div className={styles.mobileWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Organizar Dieta 🍎</h1>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dieta">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className={styles.list}>
                {refeicoes.map((ref, index) => (
                  <Draggable key={index} draggableId={`item-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={styles.card}
                      >
                        <div className={styles.dragHandle}>⠿</div> {/* Indicador visual de arraste */}
                        <div className={styles.cardHeader}>
                          <input
                            type="time"
                            className={styles.inputTime}
                            value={ref.hora}
                            onChange={(e) => {
                              const novaLista = [...refeicoes];
                              novaLista[index].hora = e.target.value;
                              setRefeicoes(novaLista);
                            }}
                          />
                          <button onClick={() => removerRefeicao(index)} className={styles.btnRemove}>✕</button>
                        </div>
                        <input
                          type="text"
                          placeholder="Nome da Refeição"
                          className={styles.inputName}
                          value={ref.nome}
                          onChange={(e) => {
                            const novaLista = [...refeicoes];
                            novaLista[index].nome = e.target.value;
                            setRefeicoes(novaLista);
                          }}
                        />
                        <textarea
                          placeholder="Itens da dieta..."
                          className={styles.textarea}
                          value={ref.itens}
                          onChange={(e) => {
                            const novaLista = [...refeicoes];
                            novaLista[index].itens = e.target.value;
                            setRefeicoes(novaLista);
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button onClick={adicionarRefeicao} className={styles.btnAdd}>+ Nova Refeição</button>
        <button onClick={salvarDieta} className={styles.btnSave}>Salvar Dieta</button>
      </div>
    </div>
  );
}
//
export default EditarDieta;