import { Link } from "@remix-run/react";
import { FileText, Map, FolderOpen, Bike, Mic, BookOpen, ExternalLink } from 'lucide-react';
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
  text,
  src = "",
  url = "#",
  target = "_blank",
  isNew = false,
  icon,
  type
}: any) => {
  const displayText = text || description;
  
  const iconMap: Record<string, any> = {
    FileText,
    Map,
    FolderOpen,
    Bike,
    Mic,
    BookOpen
  };
  
  const IconComponent = icon && iconMap[icon] ? iconMap[icon] : FileText;
  
  const getTypeColor = () => {
    switch(type) {
      case 'document': return 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200';
      case 'folder': return 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200';
      case 'external': return 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200';
      case 'media': return 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200';
      case 'wiki': return 'from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200';
      default: return 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200';
    }
  };
  
  const getIconColor = () => {
    switch(type) {
      case 'document': return 'text-blue-600';
      case 'folder': return 'text-purple-600';
      case 'external': return 'text-green-600';
      case 'media': return 'text-orange-600';
      case 'wiki': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <Link to={url} target={target}>
      <div className={`bg-gradient-to-br ${getTypeColor()} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full flex flex-col relative group border border-gray-200`}>
        {isNew && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <div className="flex items-start gap-4 mb-4">
          <div className={`${getIconColor()} flex-shrink-0`}>
            <IconComponent size={40} strokeWidth={1.5} />
          </div>
          {src && src !== "" && (
            <img
              className="h-16 w-16 object-contain flex-shrink-0"
              src={src}
              alt=""
              aria-hidden="true"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#008080] transition-colors mb-2">
              {title}
            </h3>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed flex-1">
          {displayText}
        </p>
        
        <div className="mt-4 flex items-center text-[#008080] font-medium text-sm group-hover:translate-x-1 transition-transform">
          <span>Acessar</span>
          <ExternalLink size={16} className="ml-1" />
        </div>
      </div>
    </Link>
  );
};
