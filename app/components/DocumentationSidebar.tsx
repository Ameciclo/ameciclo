import { memo } from "react";
import { HomeIcon } from "~/components/Commom/Icones/DocumentationIcons";

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

// StatusIcon component
function StatusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

// Memoized navigation item to prevent unnecessary re-renders
const NavItem = memo(({ 
  item, 
  isActive, 
  isCollapsed, 
  onClick 
}: { 
  item: NavigationItem; 
  isActive: boolean; 
  isCollapsed: boolean; 
  onClick: () => void 
}) => {
  const IconComponent = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-3 ${isActive
          ? 'bg-gray-700 text-green-400 border-l-2 border-green-400'
          : 'text-gray-300 hover:text-white'
        } ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? item.title : ''}
    >
      <IconComponent className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
      {!isCollapsed && <span className="text-sm">{item.title}</span>}
    </button>
  );
});

NavItem.displayName = 'NavItem';

function DocumentationSidebar({
  navigationItems,
  activeSection,
  isSidebarCollapsed,
  isMobile,
  isScrolled,
  onItemClick
}: DocumentationSidebarProps) {
  return (
    <div className={`${isSidebarCollapsed ? 'w-16' : isMobile ? 'w-1/3' : 'w-80'} bg-gray-800 min-h-screen p-3 lg:p-6 sticky top-16 overflow-y-auto max-h-screen transition-all duration-300 z-40 ${isMobile && !isSidebarCollapsed ? 'fixed' : ''}`}>
      <nav className="space-y-2">
        {!isSidebarCollapsed && (
          <div className="mb-4">
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
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              isCollapsed={isSidebarCollapsed}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

export default memo(DocumentationSidebar);