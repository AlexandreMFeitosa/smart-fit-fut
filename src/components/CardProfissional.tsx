import styles from "./IndicacaoDeProfissionais.module.css";

// Adicionei 'instagram' na Interface
interface CardProps {
  nome: string;
  descricao: string;
  whatsapp: string;
  instagram?: string; // O '?' indica que é opcional
}

const CardProfissional = ({ nome, descricao, whatsapp, instagram }: CardProps) => (
  <li className={styles.card}>
    <span className={styles.nomePro}>{nome}</span>
    <p className={styles.descricao}>{descricao}</p>
    <div className={styles.contatoContainer}>
      <a 
        href={`https://wa.me/${whatsapp}`} 
        target="_blank" 
        rel="noreferrer" // Boa prática de segurança para links externos
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

function IndicacaoDeProfissionais() {
  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Profissionais sugeridos:</h2>
      <hr />
      <ul className={styles.lista}>
        <CardProfissional 
          nome="Prof° Bruno Mesquita" 
          descricao="Especialista em hipertrofia e emagrecimento com mais de 5 anos de experiência."
          whatsapp="5561994262553"
          instagram="bruno_mesquita" 
        />
        <CardProfissional 
          nome="Nutri° Amanda Silva" 
          descricao="Nutricionista esportiva com foco em performance e saúde para atletas."
          whatsapp="5561994262553"
          instagram="amanda_nutri"
        />
      </ul>
    </div>
  );
}

export default IndicacaoDeProfissionais;