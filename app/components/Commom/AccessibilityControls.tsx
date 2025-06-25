import { ConfigIcon, ArrowUpIcon } from "~/components/Commom/Icones/DocumentationIcons";

interface AccessibilityControlsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  showAccessibilityMenu: boolean;
  setShowAccessibilityMenu: (value: boolean) => void;
  showScrollTop: boolean;
  onScrollTop: () => void;
}

export default function AccessibilityControls({
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  showAccessibilityMenu,
  setShowAccessibilityMenu,
  showScrollTop,
  onScrollTop
}: AccessibilityControlsProps) {
  return (
    <>
      {/* Accessibility Button */}
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 accessibility-controls">
        <button
          onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
          className={`p-3 rounded-l-lg shadow-lg transition-colors flex items-center justify-center ${
            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
          }`}
          aria-label="Opções de acessibilidade"
        >
          <ConfigIcon className="w-6 h-6 text-blue-500" />
        </button>
      </div>

      {/* Theme Toggle Button */}
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 translate-y-16 z-40 accessibility-controls theme-toggle">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-l-lg shadow-lg transition-colors flex items-center justify-center ${
            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
          }`}
          aria-label={`Mudar para modo ${darkMode ? "claro" : "escuro"}`}
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Accessibility Menu */}
      {showAccessibilityMenu && (
        <div className="fixed top-1/2 right-14 transform -translate-y-1/2 z-40 accessibility-controls">
          <div className={`p-3 rounded-lg border shadow-lg ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="text-xs font-medium mb-2">Acessibilidade:</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFontSize(Math.min(fontSize + 2, 24))} 
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    darkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  aria-label="Aumentar tamanho da fonte"
                >
                  A+
                </button>
                <button 
                  onClick={() => setFontSize(Math.max(fontSize - 2, 12))} 
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    darkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  aria-label="Diminuir tamanho da fonte"
                >
                  A-
                </button>
                <span className="text-xs">Tamanho do texto</span>
              </div>
              <button 
                onClick={() => setHighContrast(!highContrast)} 
                className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                  highContrast 
                    ? "bg-yellow-500 text-black" 
                    : darkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                aria-label="Alternar alto contraste"
              >
                <span className={`w-3 h-3 rounded-full ${highContrast ? "bg-black" : "bg-gray-400"}`}></span>
                Alto contraste {highContrast ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={onScrollTop}
          className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 accessibility-controls"
          aria-label="Voltar ao topo"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </>
  );
}