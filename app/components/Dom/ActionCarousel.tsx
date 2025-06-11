interface Action {
  cod: string;
  subcod: string;
  total: number;
  name: string;
  subname: string;
}

interface ActionsCarouselProps {
  actions: Action[];
  actionType?: string;
}

const ActionsCarousel = ({ actions, actionType = '' }: ActionsCarouselProps) => {
  const numParse = (numero: number) => numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="carousel-container fade-in">
      <div
        className="carousel-track"
        style={{
          width: `${actions.length * 200}px`,
          animation: `${actionType === 'good-action' ? 'good-scroll' : 'bad-scroll'} ${actions.length * 7}s linear infinite`,
        }}
      >
        {actions.map((action, index) => (
          <div className={`${actionType} action-card`} key={index}>
            <h3>Ação {action.cod} | Subação {action.subcod}</h3>
            <span>VALOR TOTAL ATUALIZADO</span>
            <h2>R$ {numParse(action.total)}</h2>
            <span>Título da Ação</span>
            <p>{action.name}</p>
            <span>Título da Subação</span>
            <p>- {action.subname}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionsCarousel;
