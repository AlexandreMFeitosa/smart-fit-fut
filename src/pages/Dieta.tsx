import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, set } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import styles from "./Dieta.module.css";

interface Refeicao {
  hora: string;
  nome: string;
  itens: string;
  ultimaDataConcluida?: string; // Alterado de booleano para string de data
}

export function Dieta() {
  const { user } = useAuth();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtém a data de hoje no formato "DD/MM/AAAA"
  const hoje = new Date().toLocaleDateString("pt-BR");

  const sugestoes = [
    { nome: "Ganho de Massa", calorias: "2500kcal", cor: "#22c55e" },
    { nome: "Perda de Peso", calorias: "1800kcal", cor: "#3b82f6" },
    { nome: "Definição (Cutting)", calorias: "2100kcal", cor: "#f59e0b" },
  ];

  const modelosDieta: Record<string, Refeicao[]> = {
    "Ganho de Massa": [
      { hora: "08:00", nome: "Café da Manhã", itens: "4 ovos, 100g de aveia, 1 banana" },
      { hora: "12:00", nome: "Almoço", itens: "200g arroz, 150g frango, salada" },
      { hora: "16:00", nome: "Lanche", itens: "Pão integral com pasta de amendoim" },
      { hora: "20:00", nome: "Jantar", itens: "200g batata doce, 150g carne moída" },
      { hora: "22:30", nome: "Ceia", itens: "Iogurte natural com castanhas" },
    ],
    // ... (mantenha os outros modelos iguais)
  };

  // Lógica do Contador atualizada para comparar datas
  const totalRefeicoes = refeicoes.length;
  const concluidas = refeicoes.filter(r => r.ultimaDataConcluida === hoje).length;
  const porcentagem = totalRefeicoes > 0 ? Math.round((concluidas / totalRefeicoes) * 100) : 0;

  const aplicarModelo = async (nomeModelo: string) => {
    if (!user) return;
    const confirmacao = window.confirm(`Deseja aplicar o plano de ${nomeModelo}? Sua dieta atual será substituída.`);
    if (confirmacao) {
      try {
        const dietaSelecionada = modelosDieta[nomeModelo];
        await set(ref(db, `users/${user.uid}/dieta`), dietaSelecionada);
        setRefeicoes(dietaSelecionada);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleConcluida = async (index: number) => {
    if (!user) return;
    const novasRefeicoes = [...refeicoes];
    
    // Se a data salva for hoje, desmarcamos (vazio). Se não for, marcamos como hoje.
    const jaConcluiuHoje = novasRefeicoes[index].ultimaDataConcluida === hoje;
    novasRefeicoes[index].ultimaDataConcluida = jaConcluiuHoje ? "" : hoje;
    
    setRefeicoes(novasRefeicoes);
    try {
      await set(ref(db, `users/${user.uid}/dieta`), novasRefeicoes);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user) return;
    async function carregarDieta() {
      try {
        const snapshot = await get(ref(db, `users/${user?.uid}/dieta`));
        if (snapshot.exists()) setRefeicoes(snapshot.val());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    carregarDieta();
  }, [user]);

  if (loading) return <div className="app-container"><p>Carregando...</p></div>;

  return (
    <div className="app-container">
      <div className={styles.mobileWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Minha Dieta 🍎</h1>
          
          {totalRefeicoes > 0 && (
            <div className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <span>Progresso de Hoje</span>
                <span>{concluidas}/{totalRefeicoes}</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${porcentagem}%` }}
                ></div>
              </div>
              <p className={styles.percentageText}>{porcentagem}% da dieta concluída</p>
            </div>
          )}

          <Link to="/editar-dieta" className={styles.btnEdit}>
            ⚙️ Criar / Ajustar Manualmente
          </Link>
        </header>

        {refeicoes.length === 0 && (
          <div className={styles.sugestoesContainer}>
            <p className={styles.label}>Toque em um modelo para aplicar:</p>
            <div className={styles.sugestoesGrid}>
              {sugestoes.map((sug, i) => (
                <button
                  key={i}
                  className={styles.sugestaoCard}
                  onClick={() => aplicarModelo(sug.nome)}
                  style={{ borderLeftColor: sug.cor }}
                >
                  <h4>{sug.nome}</h4>
                  <span>{sug.calorias}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.dietList}>
          {refeicoes.map((ref, index) => {
            // Verifica se a refeição foi concluída na data de HOJE
            const estaConcluidaHoje = ref.ultimaDataConcluida === hoje;

            return (
              <div
                key={index}
                className={`${styles.mealCard} ${estaConcluidaHoje ? styles.completed : ""}`}
                onClick={() => toggleConcluida(index)}
              >
                <div className={styles.mealHeader}>
                  <span className={styles.time}>{ref.hora}</span>
                  {estaConcluidaHoje && <span className={styles.checkIcon}>✅</span>}
                </div>
                <h3 className={styles.mealName}>{ref.nome}</h3>
                <p className={styles.mealItens}>{ref.itens}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dieta;