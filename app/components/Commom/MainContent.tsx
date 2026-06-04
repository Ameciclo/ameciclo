import { useRouterState } from "@tanstack/react-router";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const location = useRouterState({ select: (s) => s.location });
  const path = location.pathname;
  const isFullBleed =
    path === '/dados/ciclodados' || path === '/admin' || path.startsWith('/admin/');

  return (
    <main className={isFullBleed ? '' : 'pt-14'}>
      {children}
    </main>
  );

}