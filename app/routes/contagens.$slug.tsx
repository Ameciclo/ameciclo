import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

export async function loader({ params }: LoaderFunctionArgs) {
    const { slug } = params;
    
    try {
        const response = await fetch(`http://api.garfo.ameciclo.org/cyclist-counts`);
        const data = await response.json();
        
        const contagem = data.counts?.find((c: any) => c.slug === slug);
        
        if (!contagem) {
            throw new Response("Contagem não encontrada", { status: 404 });
        }
        
        return { contagem };
    } catch (error) {
        throw new Response("Erro ao carregar contagem", { status: 500 });
    }
}

export default function ContagemIndividual() {
    const { contagem } = useLoaderData<typeof loader>();
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };
    

    
    return (
        <>
            <Banner image="/projetos.webp" alt={`Capa da contagem ${contagem.name}`} />
            <Breadcrumb 
                label={contagem.name} 
                slug={`/contagens/${contagem.slug}`} 
                routes={["/", "/dados", "/dados/contagens"]} 
            />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">{contagem.name}</h1>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-ameciclo text-white p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium">Data:</span> {formatDate(contagem.date)}
                                </div>
                                <div>
                                    <span className="font-medium">Total de Ciclistas:</span> {contagem.total_cyclists}
                                </div>
                                <div>
                                    <span className="font-medium">Localização:</span> {contagem.name}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Estatísticas</h2>
                            <div className="space-y-3">
                                {contagem.total_women && (
                                    <div>
                                        <span className="font-medium">Mulheres:</span> {contagem.total_women}
                                    </div>
                                )}
                                {contagem.total_helmet && (
                                    <div>
                                        <span className="font-medium">Com Capacete:</span> {contagem.total_helmet}
                                    </div>
                                )}
                                {contagem.total_juveniles && (
                                    <div>
                                        <span className="font-medium">Crianças/Adolescentes:</span> {contagem.total_juveniles}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    

                    
                    <div className="flex justify-center space-x-4">
                        <a 
                            href={`http://api.garfo.ameciclo.org/cyclist-counts/edition/${contagem.id}`}
                            className="bg-ameciclo text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver Dados JSON
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}