import { useState } from "react";
import { useSearchParams } from "@remix-run/react";
import { MessageCircle, Check, X } from "lucide-react";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  lgpdChecked: boolean;
  ddi: string;
}

export function ContactForm() {
  const [searchParams] = useSearchParams();
  const initialMessage = searchParams.get("message") || "";
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<{[key: string]: boolean}>({});

  const getFormData = (): FormData => ({
    nome: (document.getElementById('nome') as HTMLInputElement)?.value || '',
    email: (document.getElementById('email') as HTMLInputElement)?.value || '',
    telefone: (document.getElementById('telefone') as HTMLInputElement)?.value || '',
    mensagem: (document.getElementById('mensagem') as HTMLTextAreaElement)?.value || '',
    lgpdChecked: (document.getElementById('lgpd') as HTMLInputElement)?.checked || false,
    ddi: (document.getElementById('ddi') as HTMLSelectElement)?.value || '+55'
  });

  const validateForm = (data: FormData): {[key: string]: string} => {
    const newErrors: {[key: string]: string} = {};
    
    if (!data.nome) newErrors.nome = 'Nome é obrigatório';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email inválido';
    }
    if (data.telefone && !/^\d{10,11}$/.test(data.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Telefone inválido';
    }
    if (!data.mensagem) newErrors.mensagem = 'Mensagem é obrigatória';
    if (!data.lgpdChecked) newErrors.lgpd = 'Você precisa aceitar os termos da LGPD';
    
    return newErrors;
  };

  const handleWhatsApp = () => {
    const data = getFormData();
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.getElementById(Object.keys(validationErrors)[0])?.focus();
      return;
    }
    
    setErrors({});

    const parts = [`*Nome:* ${data.nome}`];
    if (data.email) parts.push(`*Email:* ${data.email}`);
    if (data.telefone) parts.push(`*Telefone:* ${data.ddi}${data.telefone}`);
    parts.push('', data.mensagem);

    const whatsappMsg = parts.join('\n');
    window.open(`https://wa.me/5581994586830?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Entre em Contato</h2>
      
      <form className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              id="nome"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent ${errors.nome ? 'border-red-500 bg-red-50' : success.nome ? 'border-green-500' : 'border-gray-300'}`}
              placeholder="Seu nome"
              onChange={(e) => {
                const value = e.target.value;
                setErrors(prev => ({...prev, nome: ''}));
                setSuccess(prev => ({...prev, nome: value.length > 0}));
              }}
            />
            {errors.nome && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />}
            {success.nome && !errors.nome && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />}
          </div>
          {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <input
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent ${errors.email ? 'border-red-500 bg-red-50' : success.email ? 'border-green-500' : 'border-gray-300'}`}
              placeholder="seu@email.com (opcional)"
              onChange={(e) => {
                const value = e.target.value;
                if (value.length === 0) {
                  setErrors(prev => ({...prev, email: ''}));
                  setSuccess(prev => ({...prev, email: false}));
                } else {
                  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                  setSuccess(prev => ({...prev, email: isValid}));
                  setErrors(prev => ({...prev, email: isValid ? '' : 'Email inválido'}));
                }
              }}
            />
            {errors.email && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />}
            {success.email && !errors.email && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />}
          </div>
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <div className="flex gap-2">
            <select
              id="ddi"
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent text-sm"
              defaultValue="+55"
            >
              <option value="+55">🇧🇷 +55</option>
            </select>
            <div className="relative flex-1">
              <input
                type="tel"
                id="telefone"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent ${errors.telefone ? 'border-red-500 bg-red-50' : success.telefone ? 'border-green-500' : 'border-gray-300'}`}
                placeholder="81912345678"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, '');
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  const isValid = value.length === 0 || /^\d{10,11}$/.test(value);
                  setSuccess(prev => ({...prev, telefone: value.length > 0 && isValid}));
                  if (value.length > 0 && !isValid) {
                    setErrors(prev => ({...prev, telefone: 'Telefone inválido'}));
                  } else {
                    setErrors(prev => ({...prev, telefone: ''}));
                  }
                }}
              />
              {errors.telefone && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />}
              {success.telefone && !errors.telefone && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />}
            </div>
          </div>
          {errors.telefone && <p className="text-red-600 text-xs mt-1">{errors.telefone}</p>}
        </div>
        
        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">Mensagem <span className="text-red-500">*</span></label>
          <div className="relative">
            <textarea
              id="mensagem"
              rows={4}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent ${errors.mensagem ? 'border-red-500 bg-red-50' : success.mensagem ? 'border-green-500' : 'border-gray-300'}`}
              placeholder="Sua mensagem..."
              defaultValue={initialMessage}
              onChange={(e) => {
                const value = e.target.value;
                setErrors(prev => ({...prev, mensagem: ''}));
                setSuccess(prev => ({...prev, mensagem: value.length > 0}));
              }}
            />
            {errors.mensagem && <X size={18} className="absolute right-3 top-3 text-red-600" />}
            {success.mensagem && !errors.mensagem && <Check size={18} className="absolute right-3 top-3 text-green-600" />}
          </div>
          {errors.mensagem && <p className="text-red-600 text-xs mt-1">{errors.mensagem}</p>}
        </div>
        
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="lgpd"
            className={`mt-1 h-4 w-4 text-[#008080] focus:ring-[#008080] border-gray-300 rounded ${errors.lgpd ? 'border-red-500' : ''}`}
            required
            onChange={(e) => {
              setErrors(prev => ({...prev, lgpd: ''}));
              setSuccess(prev => ({...prev, lgpd: e.target.checked}));
            }}
          />
          <div className="flex-1">
            <label htmlFor="lgpd" className="text-sm text-gray-600">
              Concordo com o tratamento dos meus dados pessoais de acordo com a{' '}
              <a 
                href="https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#008080] underline hover:no-underline"
              >
                Lei Geral de Proteção de Dados (LGPD)
              </a>
              . Os dados fornecidos serão utilizados exclusivamente para responder ao seu contato.
            </label>
            {errors.lgpd && <p className="text-red-600 text-xs mt-1">{errors.lgpd}</p>}
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleWhatsApp}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-lg"
        >
          <MessageCircle size={20} /> Enviar via WhatsApp
        </button>

        <p className="text-center text-xs text-gray-500">
          ou <a href="mailto:contato@ameciclo.org" className="underline hover:text-[#008080]">enviar e-mail</a>
        </p>
      </form>
    </div>
  );
}
