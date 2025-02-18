import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { loader } from "../loader/status";
export { loader };

// Meta tags para a página
export const meta: MetaFunction = () => {
    return [
        { title: 'Status dos Serviços' },
        { name: 'description', content: 'Verifique o status dos serviços.' },
    ];
};

// Componente da página
export default function StatusPage() {
    const { services } = useLoaderData<typeof loader>();

    return (
        <div className="" style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Status dos Serviços</h1>
            {services.map((service, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                    <p>
                        <span style={{ color: service.status === 'OK' ? 'green' : 'red' }}>
                            <strong>[{service.status}]</strong>
                        </span>{' '}
                        <strong>{service.name}:</strong>{' '}
                        <strong style={{ color: service.status === 'OK' ? 'green' : 'red' }}>{service.url}</strong>
                    </p>
                </div>
            ))}
            <br />
        </div>
    );
}