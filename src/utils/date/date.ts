export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const exerciseDatabase = [
  { 
    name: "Supino Reto", 
    category: "Peito", 
    specs: "Faça isometria de 2 segundos no momento da contração.",
    imageUrl: "/imagens/supino-reto-halteres.gif", // Corrigido para .gif
    muscleUrl: "/imagens/supino-reto-halteres-musculos.webp"
  },
  { 
    name: "Agachamento Livre", 
    category: "Pernas", 
    specs: "Mantenha o calcanhar firme no chão e coluna alinhada.",
    imageUrl: "/imagens/agachamento-livre.webp",
    muscleUrl: "/imagens/agachamento-livre-musculo.avif"
  },
  { 
    name: "Puxada Alta Aberta", 
    category: "Costas", 
    specs: "Puxe em direção ao peito focando em esmagar as escápulas.",
    imageUrl: "/imagens/puxada-aberta.gif",
    muscleUrl: "/imagens/puxada-aberta-musculo.webp"
  },
  { 
    name: "Rosca Direta", 
    category: "Bíceps", 
    specs: "Mantenha os cotovelos colados ao tronco e evite balançar o corpo.",
    imageUrl: "/imagens/rosca-direta.gif", // Sugestão: salvar localmente
    muscleUrl: "/imagens/rosca-direta-musculo.avif"
  },
  { 
    name: "Elevação Lateral", 
    category: "Ombros", 
    specs: "Suba os braços até a linha dos ombros com leve flexão no cotovelo.",
    imageUrl: "/imagens/elevacao-lateral.gif", // Sugestão: salvar localmente
    muscleUrl: "/imagens/elevacao-lateral.gif"
  }
];