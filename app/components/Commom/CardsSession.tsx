import { Link } from "@remix-run/react";
import DevelopingComponent from "./DevelopingComponent";

export const CardsSession = ({
  title,
  cards,
}: {
  title: string;
  cards: any[];
}) => {
  if (!cards || cards.length === 0) {
    return (
      <DevelopingComponent 
        title={title} 
        subtitle="Estamos arrumando um problema nessa seção..."
      />
    );
  }

  return (
    <section>
      <div className="flex-1 container mx-auto p-10 text-center">
        <h2 className="font-bold text-3xl lg:text-4xl text-ameciclo py-8 w-1/2 mx-auto">
          {title}
        </h2>
        <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Card key={card.id || card.title || index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Card = ({
  title,
  description,
  src = "",
  url = "#",
  target = "_blank",
  isNew = false,
}: any) => {  
  return (
    <Link to={url} target={target}>
      <div className="bg-gray-100 text-ameciclo hover:text-red-500 hover:fill-red-500 w-full rounded-lg flex items-center justify-center p-10 relative">
        {isNew && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="flex flex-col text-center">
          <div className="mx-auto">
            {src != "" && (
              <img
                className="h-40 object-contain mx-auto mb-4"
                src={src}
                alt=""
                aria-hidden="true"
                height={160}
                width={160}
              />
            )}
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-wider my-2">
            {title}
          </h2>
          <p className="text-base font-medium text-gray-700">{description}</p>
        </div>
      </div>
    </Link>
  );
};
