import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, set } from "firebase/database"; // Importamos 'set' para salvar o modelo
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import styles from "./Dieta.module.css";

interface Refeicao {
  hora: string;
  nome: string;
  itens: string;
}

export function Dieta() {
  const { user } = useAuth();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [loading, setLoading] = useState(true);

  const sugestoes = [
    { nome: "Ganho de Massa", calorias: "2500kcal", cor: "#22c55e" },
    { nome: "Perda de Peso", calorias: "1800kcal", cor: "#3b82f6" },
    { nome: "Definição (Cutting)", calorias: "2100kcal", cor: "#f59e0b" }
  ];

  const modelosDieta: Record<string, Refeicao[]> = {
    "Ganho de Massa": [
      { hora: "08:00", nome: "Café da Manhã", itens: "4 ovos, 100g de aveia, 1 banana" },
      { hora: "12:00", nome: "Almoço", itens: "200g arroz, 150g frango, salada" },
      { hora: "16:00", nome: "Lanche", itens: "Pão integral com pasta de amendoim" },
      { hora: "20:00", nome: "Jantar", itens: "200g batata doce, 150g carne moída" },
      { hora: "22:30", nome: "Ceia", itens: "Iogurte natural com castanhas" }
    ],
    "Perda de Peso": [
      { hora: "08:00", nome: "Café da Manhã", itens: "2 ovos mexidos, 1 fatia de mamão" },
      { hora: "12:00", nome: "Almoço", itens: "100g arroz integral, 120g peixe, legumes" },
      { hora: "16:00", nome: "Lanche", itens: "1 maçã e 5 amêndoas" },
      { hora: "19:00", nome: "Jantar", itens: "Omelete de 3 ovos com espinafre" },
      { hora: "21:30", nome: "Ceia", itens: "Chá de camomila e 2 nozes" }
    ],
    "Definição (Cutting)": [
      { hora: "07:30", nome: "Café da Manhã", itens: "Tapioca com 3 claras e 1 gema" },
      { hora: "12:30", nome: "Almoço", itens: "Salada verde, 150g frango, 80g arroz" },
      { hora: "15:30", nome: "Lanche", itens: "Whey protein com água" },
      { hora: "19:30", nome: "Jantar", itens: "150g tilápia e brócolis no vapor" },
      { hora: "22:00", nome: "Ceia", itens: "Abacate (50g)" }
    ]
  };

  const aplicarModelo = async (nomeModelo: string) => {
    if (!user) return;
    const confirmacao = window.confirm(`Deseja aplicar o plano de ${nomeModelo}? Sua dieta atual será substituída.`);
    
    if (confirmacao) {
      try {
        const dietaSelecionada = modelosDieta[nomeModelo];
        await set(ref(db, `users/${user.uid}/dieta`), dietaSelecionada);
        setRefeicoes(dietaSelecionada);
        alert("Modelo aplicado! Você pode ajustá-lo como quiser agora.");
      } catch (error) {
        console.error("Erro ao aplicar modelo:", error);
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    async function carregarDieta() {
      try {
        const snapshot = await get(ref(db, `users/${user?.uid}/dieta`));
        if (snapshot.exists()) {
          setRefeicoes(snapshot.val());
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
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
          <p className={styles.subtitle}>Escolha um plano ou crie o seu</p>
          <Link to="/editar-dieta" className={styles.btnEdit}>⚙️ Criar / Ajustar Manualmente</Link>
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
                  <span>Toque para usar este plano</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.dietList}>
          {refeicoes.map((ref, index) => (
            <div key={index} className={styles.mealCard}>
              <span className={styles.time}>{ref.hora}</span>
              <h3 className={styles.mealName}>{ref.nome}</h3>
              <p className={styles.mealItens}>{ref.itens}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dieta;