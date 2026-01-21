import { useEffect } from 'react';
import { useApiStatus } from '~/contexts/ApiStatusContext';

interface ApiStatusHandlerProps {
  apiDown?: boolean;
}

export function ApiStatusHandler({ apiDown }: ApiStatusHandlerProps) {
  const { setApiDown } = useApiStatus();

  useEffect(() => {
    if (apiDown) {
      setApiDown(true);
    }
  }, [apiDown, setApiDown]);

  return null;
}