import { HomeIcon } from "lucide-react";

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DocumentationSidebarProps {
  navigationItems: NavigationItem[];
  activeSection: string;
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  isScrolled: boolean;
  onItemClick: (sectionId: string) => void;
}

// Placeholder for StatusIcon - replace with actual icon
const StatusIcon = ({ className }: { className?: string }) => (
  <div className={`${className} bg-gray-400 rounded`}></div>
);

export default function DocumentationSidebar({
  navigationItems,
  activeSection,
  isSidebarCollapsed,
  isMobile,
  isScrolled,
  onItemClick
}: DocumentationSidebarProps) {
  return (
    <div className={`${isSidebarCollapsed ? 'w-16' : isMobile ? 'w-1/3' : 'w-80'} bg-gray-800 min-h-screen p-3 lg:p-6 sticky top-20 overflow-y-auto max-h-screen transition-all duration-300 z-50 ${isMobile && !isSidebarCollapsed ? 'fixed' : ''}`}>
      <nav className={`space-y-2 ${isScrolled ? 'mt-0' : 'mt-20'} transition-all`}>
        {!isSidebarCollapsed && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-green-400 duration-300 mb-3">Navegação</h2>
            <div className="space-y-2">
              <a href="/" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                <HomeIcon className="w-4 h-4" />
                Voltar ao site
              </a>
              <a href="/status" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 p-2 rounded hover:bg-gray-700">
                <StatusIcon className="w-4 h-4" />
                Status dos Serviços
              </a>
            </div>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="mb-4 flex flex-col items-center space-y-2">
            <a href="/" className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded hover:bg-gray-700" title="Voltar ao site">
              <HomeIcon className="w-5 h-5" />
            </a>
            <a href="/status" className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded hover:bg-gray-700" title="Status dos Serviços">
              <StatusIcon className="w-5 h-5" />
            </a>
          </div>
        )}

        <div className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={`w-full text-left px-3 py-3 rounded hover:bg-gray-700 transition-colors flex items-center gap-3 ${activeSection === item.id
                    ? 'bg-gray-700 text-green-400 border-l-2 border-green-400'
                    : 'text-gray-300 hover:text-white'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? item.title : ''}
              >
                <IconComponent className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!isSidebarCollapsed && <span className="text-sm">{item.title}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}