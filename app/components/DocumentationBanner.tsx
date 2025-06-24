import { BookOpenIcon, CodeIcon } from "lucide-react";

export default function DocumentationBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800 border-b border-green-500/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <CodeIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Documentação
          </h1>
          
          <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed">
            Guia completo para desenvolvimento e contribuição no projeto de mobilidade ativa do Recife
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-green-100 text-sm font-medium">Remix + TypeScript</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-green-100 text-sm font-medium">React Components</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-green-100 text-sm font-medium">API Integration</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
}