import { generateSlug } from "../generateSlug";

const baseExercises = [
  // Exercicios de Peito ...
  { 
    name: "Supino Reto com Barra",
    category: "Peito",
    specs: "Desca a barra até o peito..."
  },
  { 
    name: "Supino Reto com Halteres", 
    category: "Peito",
    specs: "Desca os halteres lateralmente ao peito..."
  },
  { 
    name: "Supino Inclinado",
    category: "Peito",
    specs: "Puxe a barra em direcao à parte superior do peito."
  },
  { 
    name: "Supino Declinado",
    category: "Peito",
    specs: "Puxe a barra em direcao à parte inferior do peito."
  },
  { 
    name: "Crucifixo Maquina",
    category: "Peito",
    specs: "Abra os bracos lateralmente mantendo uma leve flexao nos cotovelos..."
  },
  { 
    name: "Crossover no Cabo",
    category: "Peito",
    specs: "Puxe as alcas do cabo para frente e para baixo, cruzando as maos na frente do corpo..."
  },

  // Costas
  { 
    name: "Remada Curvada com Barra", 
    category: "Costas",
    specs: "Puxe a barra em direcao ao abdômen, mantendo as costas retas..."
  },
  { 
    name: "Remada Unilateral com Halteres", 
    category: "Costas",
    specs: "Puxe o haltere em direcao ao quadril, mantendo o tronco estável..."
  },
  { 
    name: "Puxada na Polia Alta", 
    category: "Costas",
    specs: "Puxe a barra em direcao ao peito, mantendo os cotovelos apontados para baixo..."
  },
  { 
    name: "Remada Sentado Baixa", 
    category: "Costas",
    specs: "Puxe a alca do cabo em direcao ao abdômen, mantendo as costas retas..."
  },
  //pernas
  {
    name: "Agachamento Livre com Barra", 
    category: "Pernas",
    specs: "Desca o quadril para trás e para baixo, mantendo o peito erguido..."
  },
  { 
    name: "Leg Press 45", 
    category: "Pernas",
    specs: "Empurre a plataforma com os pés, estendendo as pernas..."
  },
  { 
    name: "Cadeira Extensora", 
    category: "Pernas",
    specs: "Estenda as pernas contra a resistência da máquina..."
  },
  { 
    name: "Cadeira Flexora", 
    category: "Pernas",
    specs: "Flexione as pernas contra a resistência da máquina..."
  },
  //ombros
  {
    name: "Desenvolvimento com Barra", 
    category: "Ombros",
    specs: "Empurre a barra para cima até estender completamente os bracos..."
  },
  { 
    name: "Elevacao Lateral com Halteres", 
    category: "Ombros",
    specs: "Levante os halteres lateralmente até a altura dos ombros..."
  },
  { 
    name: "Elevacao Frontal com Halteres", 
    category: "Ombros",
    specs: "Levante os halteres para frente até a altura dos ombros..."
  },
  { 
    name: "Desenvolvimento maquina", 
    category: "Ombros",
    specs: "Empurre as alcas da máquina para cima até estender completamente os bracos..."
  }
];

export const exerciseDatabase = baseExercises.map(ex => {
  const exerciseSlug = generateSlug(ex.name);
  const categorySlug = generateSlug(ex.category); // Cria o nome da pasta (ex: "Peito" -> "peito")

  return {
    ...ex,
    id: exerciseSlug,
    // O caminho agora monta: /imagens/categoria/nome-do-exercicio.webp
    imageUrl: `/imagens/${categorySlug}/${exerciseSlug}.png`, 
    muscleUrl: `/imagens/${categorySlug}/${exerciseSlug}-musculo.png`
  };
});