import { useLocation } from "@remix-run/react";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const location = useLocation();
  const isDataPage = location.pathname.startsWith('/dados');
  
  return (
    <main className={isDataPage ? "pt-14 xl:pt-20" : "pt-14"}>
      {children}
    </main>
  );
}