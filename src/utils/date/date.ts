export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const exerciseDatabase = [
  // --- PEITO ---
  { 
    name: "Supino Reto", 
    category: "Peito", 
    specs: "Faça isometria de 2 segundos no momento da contração.",
    imageUrl: "/imagens/supino-reto-halteres-foto.jpg", 
    muscleUrl: "/imagens/supino-reto-halteres-musculos.webp"
  },
  { 
    name: "Supino Inclinado", 
    category: "Peito", 
    specs: "Foco na parte superior do peito. Não bata os halteres no topo.",
    imageUrl: "/imagens/supino-inclinado-halteres-foto.png",
    muscleUrl: "/imagens/supino-inclinado-gif.gif"
  },
  { 
    name: "Crucifixo Máquina (Peck Deck)", 
    category: "Peito", 
    specs: "Mantenha os cotovelos levemente flexionados e sinta o alongamento.",
    imageUrl: "/imagens/peck-deck-musculo.avif",
    muscleUrl: "/imagens/peck-deck-musculo.avif"
  },

  // --- COSTAS ---
  { 
    name: "Puxada Alta Aberta", 
    category: "Costas", 
    specs: "Puxe em direção ao peito focando em esmagar as escápulas.",
    imageUrl: "/imagens/puxada-aberta-foto.jpeg",
    muscleUrl: "/imagens/puxada-aberta-musculo.webp"
  },
  { 
    name: "Remada Baixa Triângulo", 
    category: "Costas", 
    specs: "Mantenha a coluna reta e puxe o peso em direção ao umbigo.",
    imageUrl: "/imagens/remada-baixa-triângulo.webp",
    muscleUrl: "/imagens/remada-baixa-musculo.webp"
  },
  { 
    name: "Remada Curvada com Barra", 
    category: "Costas", 
    specs: "Mantenha o tronco inclinado e o core bem contraído.",
    imageUrl: "/imagens/remada-curvada.jpeg",
    muscleUrl: "/imagens/remada-curvada-gif.webp"
  },

  // --- PERNAS ---
  { 
    name: "Agachamento Livre", 
    category: "Pernas", 
    specs: "Mantenha o calcanhar firme no chão e coluna alinhada.",
    imageUrl: "/imagens/agachamento-livre.webp",
    muscleUrl: "/imagens/agachamento-livre-musculo.avif"
  },
  { 
    name: "Leg Press 45°", 
    category: "Pernas", 
    specs: "Não estenda totalmente os joelhos para preservar a articulação.",
    imageUrl: "/imagens/leg-press-45.gif",
    muscleUrl: "/imagens/leg-press-45.jpeg"
  },
  { 
    name: "Cadeira Extensora", 
    category: "Pernas", 
    specs: "Ajuste o banco para que o joelho coincida com o eixo da máquina.",
    imageUrl: "/imagens/cadeira-extensora.gif",
    muscleUrl: "/imagens/extensora-musculo.webp"
  },
  { 
    name: "Mesa Flexora", 
    category: "Pernas", 
    specs: "Mantenha o quadril colado no banco durante a subida.",
    imageUrl: "/imagens/mesa-flexora.gif",
    muscleUrl: "/imagens/flexora-musculo.webp"
  },

  // --- OMBROS ---
  { 
    name: "Elevação Lateral", 
    category: "Ombros", 
    specs: "Suba os braços até a linha dos ombros com leve flexão no cotovelo.",
    imageUrl: "/imagens/elevacao-lateral.gif",
    muscleUrl: "/imagens/elevacao-lateral-musculo.webp"
  },
  { 
    name: "Desenvolvimento com Halteres", 
    category: "Ombros", 
    specs: "Suba os pesos em arco, sem encostar um halter no outro.",
    imageUrl: "/imagens/desenvolvimento-ombros.gif",
    muscleUrl: "/imagens/desenvolvimento-musculo.webp"
  },

  // --- BRAÇOS (BÍCEPS/TRÍCEPS) ---
  { 
    name: "Rosca Direta", 
    category: "Bíceps", 
    specs: "Mantenha os cotovelos colados ao tronco e evite balançar o corpo.",
    imageUrl: "/imagens/rosca-direta.gif",
    muscleUrl: "/imagens/rosca-direta-musculo.avif"
  },
  { 
    name: "Rosca Martelo", 
    category: "Bíceps", 
    specs: "Pegada neutra (palmas viradas para dentro). Foco no braquiorradial.",
    imageUrl: "/imagens/rosca-martelo.gif",
    muscleUrl: "/imagens/martelo-musculo.webp"
  },
  { 
    name: "Tríceps Pulley (Corda)", 
    category: "Tríceps", 
    specs: "Abra a corda no final do movimento para maior contração.",
    imageUrl: "/imagens/triceps-corda.gif",
    muscleUrl: "/imagens/triceps-corda-musculo.webp"
  },
  { 
    name: "Tríceps Testa", 
    category: "Tríceps", 
    specs: "Desça o peso em direção à testa mantendo os cotovelos fechados.",
    imageUrl: "/imagens/triceps-testa.gif",
    muscleUrl: "/imagens/triceps-testa-musculo.webp"
  }
];