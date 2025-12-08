import { useLocation } from "@remix-run/react";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const location = useLocation();
  const isCicloDadosPage = location.pathname === '/dados/ciclodados';
  
  return (
    <main className={isCicloDadosPage ? '' : 'pt-14'}>
      {children}
    </main>
  );

}