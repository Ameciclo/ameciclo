import { Link } from "@remix-run/react";

interface ProjectPageProps {
  project: any;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const translationLinks = [];

  if (project.translations?.es) {
    translationLinks.push(
      <Link to={`/projetos/${project.translations.es.slug}`} key="es">
        <span className="flex items-center mx-2 text-lg hover:text-ameciclo">
          <span role="img" aria-label="Espanhol" className="mr-1">🇪🇸</span>
          <span>Traducción</span>
        </span>
      </Link>
    );
  }

  if (project.translations?.en) {
    translationLinks.push(
      <Link to={`/projetos/${project.translations.en.slug}`} key="en">
        <span className="flex items-center mx-2 text-lg hover:text-ameciclo">
          <span role="img" aria-label="Inglês" className="mr-1">🇬🇧</span>
          <span>Translation</span>
        </span>
      </Link>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {project.media?.url && (
          <div className="mb-8">
            <img 
              src={project.media.url} 
              alt={project.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
          
          {project.workgroup?.name && (
            <p className="text-lg text-gray-600 mb-2">
              Grupo de trabalho: <span className="font-semibold">{project.workgroup.name}</span>
            </p>
          )}
          
          {project.status && (
            <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                 style={{
                   backgroundColor: project.status === 'ongoing' ? '#008080' : 
                                   project.status === 'paused' ? '#F48A42' : '#00A870',
                   color: 'white'
                 }}>
              {project.status === 'ongoing' ? 'Em andamento' : 
               project.status === 'paused' ? 'Pausado' : 'Realizado'}
            </div>
          )}
        </div>

        {project.description && (
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">{project.description}</p>
          </div>
        )}

        {project.content && (
          <div className="prose max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: project.content }} />
          </div>
        )}

        {translationLinks.length > 0 && (
          <div className="border-t pt-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Outras versões:</h3>
            <div className="flex flex-wrap gap-4">
              {translationLinks}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}