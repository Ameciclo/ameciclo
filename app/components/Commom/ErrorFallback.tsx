import { useRouteError, isRouteErrorResponse } from "@remix-run/react";

export default function ErrorFallback({ error }: any) {
    return (
        <div className="flex flex-col pt-16 items-center justify-start h-max text-gray-900">
            <h1 className="text-5xl font-bold pb-16">Ocorreu um erro 😢</h1>
            {isRouteErrorResponse(error) ? (
                <>
                    <p className="text-1xl font-bold pb-6">Tente mais tarde..</p>
                    <p className="text-5xl font-bold pb-6">{error.status}</p>
                    {error.data?.message && <p>Detalhes: {error.data.message}</p>}
                </>
            ) : (
                <>
                    <p className="text-5xl font-bold pb-6">500</p>
                    <p>Algo deu errado. Tente novamente mais tarde.</p>
                    <CallToContact message="Fale com um desenvolvedor" error={error} route={error.data?.route}/>
                </>
            )}
        </div>
    );
}

function CallToContact({ message, error, route }: { message: string; error: any; route: string }) {
    const status = error.status ? error.status : "500";
    const errorMessage = error?.message || "Erro desconhecido";

    const whatsappMessage = `
Nome: [SEU_NOME]
Quer falar sobre?: [SEU_TEXTO]

**Nao apague esse texto**
Mensagem de erro para página ${route}

Status: ${status}
Erro: ${errorMessage}
`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappLink = `https://wa.me/5599999999999?text=${encodedMessage}`;

    return (
        <>
            <p className="mb-2 text-1xl font-bold pt-6">Entre em contato:</p>
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
            >
                <button className="px-4 py-3 bg-ameciclo text-white rounded-md">
                    {message}
                </button>
            </a>
        </>
    );
}


