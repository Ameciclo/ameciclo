function getCurrentRoute(): string {
  return typeof window !== "undefined" ? window.location.pathname : "DESCONHECIDA";
}

interface ErrorFallbackProps {
  error: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export default function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-900 px-6 py-20">
      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">Ocorreu um erro</h1>
        <>
          <p className="text-lg md:text-xl font-bold mb-6 text-center">Tente mais tarde</p>
          <p className="text-4xl md:text-5xl font-bold mb-6 text-center">{error.status}</p>
          {error.data?.message && <p className="text-center mb-4">Detalhes: {error.data.message}</p>}
          <CallToContact
            message="Reportar"
            error={error}
            route={getCurrentRoute()}
          />
        </>
    </div>
  );
}

interface CallToContactProps {
  message: string;
  error: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  route: string;
}

function CallToContact({
  message,
  error,
  route,
}: CallToContactProps) {
  const status = error.status ? error.status : "500";
  const errorMessage = error?.data?.message || "Erro desconhecido";

  const whatsappMessage = `
Nome: [SEU_NOME]
Quer falar sobre?: [SEU_TEXTO]

**Não apague esse texto**
Mensagem de erro para página: ${route}

Status: ${status}
Erro: ${errorMessage}
`;

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappLink = `https://wa.me/558197860060?text=${encodedMessage}`;

  return (
    <>
      <p className="mb-2 text-lg md:text-xl font-bold pt-6 text-center">Entre em contato:</p>
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
        <button className="px-4 py-3 bg-ameciclo text-white rounded-md">
          {message}
        </button>
      </a>
    </>
  );
}
