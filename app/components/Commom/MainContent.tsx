import { useRouterState } from "@tanstack/react-router";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const location = useRouterState({ select: (s) => s.location });
  const isCicloDadosPage = location.pathname === '/dados/ciclodados';
  
  return (
    <main className={isCicloDadosPage ? '' : 'pt-14'}>
      {children}
    </main>
  );

}