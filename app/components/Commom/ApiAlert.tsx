import { useApiStatus } from '~/contexts/ApiStatusContext';

export function ApiAlert() {
  const { isApiDown } = useApiStatus();

  if (!isApiDown) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 w-fit bg-orange-500 text-white px-3 py-2 text-center z-[90] rounded-b-lg">
      <p className="text-sm">
        ⚠️ Os dados do site estão temporariamente indisponíveis. Podem ocorrer erros na página.{' '}
        <button 
          onClick={() => window.location.reload()} 
          className="underline hover:no-underline mx-2"
        >
          Recarregar
        </button>
        |{' '}
        <a 
          href="https://github.com/Ameciclo/ameciclo/issues" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:no-underline mx-2"
        >
          Reportar
        </a>
      </p>
    </div>
  );
}