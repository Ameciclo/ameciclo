import { Link } from "@remix-run/react";
import { Globe } from "lucide-react";

interface LanguageBadgeProps {
  currentSlug: string;
}

export const LanguageBadge = ({ currentSlug }: LanguageBadgeProps) => {
  let baseSlug = currentSlug;
  
  if (currentSlug.endsWith('_en')) {
    baseSlug = currentSlug.replace('_en', '');
  } else if (currentSlug.endsWith('_es')) {
    baseSlug = currentSlug.replace('_es', '');
  }

  const translations = [
    { lang: 'en', flag: '🇬🇧', slug: `${baseSlug}_en`, label: 'English' },
    { lang: 'es', flag: '🇪🇸', slug: `${baseSlug}_es`, label: 'Español' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      {translations.map((t) => (
        <Link
          key={t.lang}
          to={`/projetos/${t.slug}`}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-teal-50 rounded-md transition-colors group"
          title={t.label}
        >
          <span className="text-base">{t.flag}</span>
          <span className="text-xs text-gray-600 group-hover:text-teal-600 font-medium">
            {t.lang.toUpperCase()}
          </span>
        </Link>
      ))}
    </div>
  );
};
