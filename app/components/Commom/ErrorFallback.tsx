import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';

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
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-3xl md:text-4xl font-bold">Ocorreu um erro</AlertTitle>
        <AlertDescription className="mt-4 space-y-4">
          <p className="text-lg font-bold">Tente mais tarde</p>
          {error.status && <p className="text-4xl font-bold text-center">{error.status}</p>}
          {error.data?.message && <p>Detalhes: {error.data.message}</p>}
          <CallToContact
            message="Reportar"
            error={error}
            route={getCurrentRoute()}
          />
        </AlertDescription>
      </Alert>
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
    <div className="pt-4 text-center">
      <p className="mb-2 text-lg font-bold">Entre em contato:</p>
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
        <Button className="bg-ameciclo hover:bg-green-600">
          {message}
        </Button>
      </a>
    </div>
  );
}
