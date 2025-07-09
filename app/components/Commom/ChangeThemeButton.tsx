interface ChangeThemeButtonProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function ChangeThemeButton({ darkMode, setDarkMode }: ChangeThemeButtonProps) {
  return (
    <div className="fixed top-1/4 right-0 transform -translate-y-1/2 translate-y-16 z-40 theme-toggle">
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
  );
}