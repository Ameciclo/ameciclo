import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';

interface CachePermissionBarProps {
  onAllow: () => void;
  onDeny: () => void;
}

export default function CachePermissionBar({ onAllow, onDeny }: CachePermissionBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachePermission = localStorage.getItem('cache-permission');
      if (!cachePermission) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllow = () => {
    localStorage.setItem('cache-permission', 'allowed');
    setIsVisible(false);
    onAllow();
  };

  const handleDeny = () => {
    localStorage.setItem('cache-permission', 'denied');
    setIsVisible(false);
    onDeny();
  };

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent
        onClose={() => setIsVisible(false)}
        className="sm:max-w-4xl"
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-sm">
                Melhorar sua experiência
              </DialogTitle>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">
                Utilizamos cache local para acelerar o carregamento das páginas e melhorar sua navegação.
                Os dados são armazenados temporariamente apenas no seu navegador.
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDeny}
            aria-label="Não permitir cache"
          >
            Não permitir
          </Button>
          <Button
            onClick={handleAllow}
            className="bg-ameciclo hover:bg-green-600"
            aria-label="Permitir cache"
          >
            Permitir cache
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
