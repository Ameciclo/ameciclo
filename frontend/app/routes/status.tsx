import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

interface ServiceStatus {
    name: string;
    url: string;
    status: 'OK' | 'OFF';
}

// Meta tags para a página
export const meta: MetaFunction = () => {
    return [
        { title: 'Status dos Serviços' },
        { name: 'description', content: 'Verifique o status dos serviços.' },
    ];
};

// Loader para verificar o status dos serviços
export async function loader({ request }: LoaderFunctionArgs) {
    // Lista de serviços para verificar
    const services = [
        { name: 'Página - Página Inicial', url: 'ameciclo.org' },
        { name: 'Página - Associe-se', url: 'queroser.ameciclo.org' },
        { name: 'Página - Participe', url: 'participe.ameciclo.org' },
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

// Componente da página
export default function StatusPage() {
    const { services } = useLoaderData<typeof loader>();

    return (
        <div className="" style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <br />
            <br />
            <br />
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Status dos Serviços</h1>
            {services.map((service, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                    <p>
                        <strong>{service.name}:</strong>{' '}
                        <strong>{service.url}</strong>{'    '}
                        <span style={{ color: service.status === 'OK' ? 'green' : 'red' }}>
                            {service.status}
                        </span>
                    </p>
                </div>
            ))}
            <br />
        </div>
    );
}