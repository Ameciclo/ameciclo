import { useState, useRef, useEffect } from 'react';

const LanguageSelector = ({ links }: { links: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 focus:outline-none transition-colors"
        aria-label="Selecionar idioma"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1 rounded-md bg-white shadow-xs">
            {links.map((link: any) => (
              <a
                key={link.id}
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="mr-2 text-xl">{link.title}</span>
                <span className="capitalize">{link.language || 'Tradução'}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;