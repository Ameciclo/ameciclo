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
        <h3 className="font-bold text-3xl lg:text-4xl text-ameciclo py-8 w-1/2 mx-auto">
          {title}
        </h3>
        <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {cards.map((card) => (
            <Card {...card} />
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
}: any) => {  
  return (
    <Link to={url} target={target}>
      <div className="bg-gray-100 text-ameciclo hover:text-red-500 hover:fill-red-500 w-full rounded-lg flex items-center justify-center p-10">
        <div className="flex flex-col text-center">
          <div className="mx-auto">
            {src != "" && (
              <img
                className="h-50 hover:fill-red-500 hover:text-red-500"
                src={src}
                alt={title}
                height={100}
                width={100}
              />
            )}
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-wider my-2">
            {title}
          </h2>
          <p className="text-base font-medium">{description}</p>
        </div>
      </div>
    </Link>
  );
};
