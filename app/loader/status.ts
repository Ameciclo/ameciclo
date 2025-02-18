import { json, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    // Lista de serviços para verificar
    const services = [
        { name: 'API - STRAPI V3', url: 'cms.ameciclo.org' },
        { name: 'API - STRAPI V4', url: 'test.cms.ameciclo.org' },
        { name: 'Página site - Página Inicial', url: 'ameciclo.org' },
        { name: 'Página site - Quem Somos', url: 'ameciclo.org/quem_somos' },
        { name: 'Página site - Agenda', url: 'ameciclo.org/agenda' },
        { name: 'Página site - Projetos', url: 'ameciclo.org/projetos' },
        { name: 'Página site - Contato', url: 'ameciclo.org/contato' },
        { name: 'Página dados - Página Principal', url: 'ameciclo.org/dados' },
        { name: 'Página dados - Contagens', url: 'ameciclo.org/dados/contagens' },
        { name: 'Página dados - Documentos', url: 'ameciclo.org/dados/documentos' },
        { name: 'Página dados - Ideciclo', url: 'ameciclo.org/dados/ideciclo' },
        { name: 'Página observatório - Observatório', url: 'ameciclo.org/observatorio' },
        { name: 'Página observatório - Execução Cicloviária', url: 'ameciclo.org/observatorio/execucao_cicloviaria' },
        { name: 'Página observatório - Loa Clima', url: 'ameciclo.org/observatorio/loa' },
        { name: 'Página observatório - Perfil', url: 'ameciclo.org/observatorio/dom' },
        { name: 'Serviço - Associe-se', url: 'docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform' },
        { name: 'Serviço - Participe', url: 'participe.ameciclo.org' },
    ];

    // Função para verificar o status de um serviço
    const checkStatus = async (url: string): Promise<'OK' | 'OFF'> => {
        try {
            const response = await fetch(`https://${url}`, { method: 'HEAD' });
            return response.ok ? 'OK' : 'OFF';
        } catch (error) {
            return 'OFF';
        }
    };

    // Verificar o status de todos os serviços
    const servicesWithStatus = await Promise.all(
        services.map(async (service) => {
            const status = await checkStatus(service.url);
            return { ...service, status };
        }),
    );

    // Retornar os dados para o componente
    return json({ services: servicesWithStatus });
}