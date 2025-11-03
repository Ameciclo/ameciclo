import { Bot } from 'lucide-react';

interface FloatingChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FloatingChat({ isOpen, onToggle }: FloatingChatProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`transition-all duration-500 ease-in-out transform ${
        isOpen 
          ? 'w-80 h-auto scale-100 opacity-100' 
          : 'w-auto h-auto scale-100 opacity-100'
      }`}>
        {isOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-white">IA Ameciclo</span>
              </div>
              <button 
                onClick={onToggle}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl text-sm">
                Olá! Como posso ajudar você com os dados de mobilidade urbana?
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Digite sua pergunta..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button className="p-3 text-gray-400 hover:text-pink-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onToggle}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center overflow-hidden group hover:pr-4 transform hover:scale-105"
          >
            <div className="p-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="whitespace-nowrap font-medium pr-0 group-hover:pr-3 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              IA Ameciclo
            </span>
          </button>
        )}
      </div>
    </div>
  );
}