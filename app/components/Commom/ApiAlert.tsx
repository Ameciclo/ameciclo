import { useApiStatus } from '~/contexts/ApiStatusContext';

export function ApiAlert() {
  const { isApiDown } = useApiStatus();

  if (!isApiDown) return null;

  return (
    <div className="fixed top-14 left-0 right-0 bg-orange-500 text-white px-4 py-3 text-center z-[70] animate-pulse">
      <p className="text-sm">
        ⚠️ Os dados do site estão temporariamente indisponíveis. Podem ocorrer erros na página.
      </p>
    </div>
  );
}