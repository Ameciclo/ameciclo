import { Link } from "@remix-run/react";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface LanguageSelectorProps {
  currentSlug: string;
  availableLanguages?: Array<{
    lang: string;
    slug: string;
  }>;
}

export const LanguageSelector = ({ currentSlug, availableLanguages = [] }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detectar idioma atual
  let currentLang = 'pt';
  let baseSlug = currentSlug;
  
  if (currentSlug.endsWith('_en')) {
    currentLang = 'en';
    baseSlug = currentSlug.replace('_en', '');
  } else if (currentSlug.endsWith('_es')) {
    currentLang = 'es';
    baseSlug = currentSlug.replace('_es', '');
  }

  const languages = [
    { lang: 'pt', flag: '🇧🇷', label: 'Português', slug: baseSlug },
    { lang: 'en', flag: '🇬🇧', label: 'English', slug: `${baseSlug}_en` },
    { lang: 'es', flag: '🇪🇸', label: 'Español', slug: `${baseSlug}_es` },
  ];

  const currentLanguage = languages.find(l => l.lang === currentLang);
  const otherLanguages = languages.filter(l => l.lang !== currentLang);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white font-medium shadow-lg backdrop-blur-sm"
        aria-label="Selecionar idioma"
      >
        <Globe className="w-5 h-5" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl overflow-hidden z-50 min-w-[180px] border border-gray-200">
          {otherLanguages.map((lang) => (
            <Link
              key={lang.lang}
              to={`/projetos/${lang.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-teal-600"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
