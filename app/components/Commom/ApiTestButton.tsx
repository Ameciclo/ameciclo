import { useApiStatus } from '~/contexts/ApiStatusContext';

export function ApiTestButton() {
  const { isApiDown, setApiDown } = useApiStatus();

  return (
    <button 
      onClick={() => setApiDown(!isApiDown)}
      className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-50"
    >
      {isApiDown ? 'API UP' : 'API DOWN'}
    </button>
  );
}