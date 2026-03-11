import styles from "./IndicacaoDeProfissionais.module.css";

// 1. Definição do contrato de dados (Props)
interface CardProps {
  nome: string;
  descricao: string;
  whatsapp: string;
  instagram?: string;
}

// 2. Molde do Card (Componente Reutilizável)
const CardProfissional = ({ nome, descricao, whatsapp, instagram }: CardProps) => (
  <li className={styles.card}>
    <span className={styles.nomePro}>{nome}</span>
    <p className={styles.descricao}>{descricao}</p>
    <div className={styles.contatoContainer}>
      <a 
        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} 
        target="_blank" 
        rel="noreferrer"
        className={styles.linkWhatsapp}
      >
        WhatsApp
      </a>
      {instagram && (
        <a 
          href={`https://instagram.com/${instagram}`} 
          target="_blank" 
          rel="noreferrer"
          className={styles.linkInstagram}
        >
          Instagram
        </a>
      )}
    </div>
  </li>
);

// 3. Lista de dados (Simulando um banco de dados)
const PROFISSIONAIS = [
  {
    nome: "Prof° Bruno Mesquita",
    descricao: "Especialista em hipertrofia e emagrecimento com mais de 5 anos de experiência.",
    whatsapp: "5561994262553",
    instagram: "bruno_mesquita"
  },
  {
    nome: "Nutri° Amanda Silva",
    descricao: "Nutricionista esportiva com foco em performance e saúde para atletas.",
    whatsapp: "5561994262553",
    instagram: "amanda_nutri"
  },
  {
    nome: "Prof° Alexandre Moraes",
    descricao: "Personal trainer focado em atletas de esportes de corrida, maratonas e musculação.",
    whatsapp: "5561994262553",
    instagram: "alexandre_moraes"
  }
];

// 4. Componente Principal da Página
function IndicacaoDeProfissionais() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Profissionais sugeridos</h2>
      </div>
      <hr />
      
      <ul className={styles.lista}>
        {PROFISSIONAIS.map((pro, index) => (
          <CardProfissional 
            key={index} // Chave única para o React
            nome={pro.nome}
            descricao={pro.descricao}
            whatsapp={pro.whatsapp}
            instagram={pro.instagram}
          />
        ))}
      </ul>
    </div>
  );
}

export default IndicacaoDeProfissionais;