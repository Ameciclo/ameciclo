import { memo } from 'react';

interface DocumentationBannerProps {
  title: string;
  subtitle: string;
}

function DocumentationBanner({ title, subtitle }: DocumentationBannerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8 rounded-lg overflow-hidden relative bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="h-48 md:h-64 flex items-center justify-center relative">
          <div className="text-center text-white z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
            <p className="text-lg md:text-xl opacity-90">{subtitle}</p>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 gap-4 h-full p-8">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className={`rounded ${
                  i % 3 === 0 ? "bg-green-400" : i % 3 === 1 ? "bg-blue-400" : "bg-purple-400"
                }`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DocumentationBanner);