import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { Mail, MessageCircle, Check, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  lgpdChecked: boolean;
  ddi: string;
}

export function ContactForm() {
  const searchParams = useSearch({ strict: false });
  const initialMessage = (searchParams as any).message || "";
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
    if (!data.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email inválido';
    }
    if (data.telefone && !/^\d{10,11}$/.test(data.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Telefone inválido';
    }
    if (!data.mensagem) newErrors.mensagem = 'Mensagem é obrigatória';
    if (!data.lgpdChecked) newErrors.lgpd = 'Você precisa aceitar os termos da LGPD';

    return newErrors;
  };

  const handleFormSubmit = (callback: (data: FormData) => void) => {
    const data = getFormData();
    const validationErrors = validateForm(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.getElementById(Object.keys(validationErrors)[0])?.focus();
      return;
    }

    setErrors({});
    callback(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Entre em Contato</h2>

      <form className="space-y-4">
        <div>
          <Label htmlFor="nome" className="mb-1">Nome <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              type="text"
              id="nome"
              required
              className={cn(
                errors.nome && 'border-red-500 bg-red-50',
                success.nome && !errors.nome && 'border-green-500'
              )}
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
          <Label htmlFor="email" className="mb-1">Email <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              type="email"
              id="email"
              required
              className={cn(
                errors.email && 'border-red-500 bg-red-50',
                success.email && !errors.email && 'border-green-500'
              )}
              placeholder="seu@email.com"
              onChange={(e) => {
                const value = e.target.value;
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                setSuccess(prev => ({...prev, email: isValid}));
                if (value.length > 0 && !isValid) {
                  setErrors(prev => ({...prev, email: 'Email inválido'}));
                } else {
                  setErrors(prev => ({...prev, email: ''}));
                }
              }}
            />
            {errors.email && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />}
            {success.email && !errors.email && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />}
          </div>
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="telefone" className="mb-1">Telefone</Label>
          <div className="flex gap-2">
            <Select
              id="ddi"
              className="w-auto"
              defaultValue="+55"
            >
              <option value="+55">+55</option>
            </Select>
            <div className="relative flex-1">
              <Input
                type="tel"
                id="telefone"
                className={cn(
                  errors.telefone && 'border-red-500 bg-red-50',
                  success.telefone && !errors.telefone && 'border-green-500'
                )}
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
          <Label htmlFor="mensagem" className="mb-1">Mensagem <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Textarea
              id="mensagem"
              rows={4}
              required
              className={cn(
                errors.mensagem && 'border-red-500 bg-red-50',
                success.mensagem && !errors.mensagem && 'border-green-500'
              )}
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
            className={cn(
              "mt-1 h-4 w-4 text-[#008080] focus:ring-[#008080] border-gray-300 rounded",
              errors.lgpd && 'border-red-500'
            )}
            required
            onChange={(e) => {
              setErrors(prev => ({...prev, lgpd: ''}));
              setSuccess(prev => ({...prev, lgpd: e.target.checked}));
            }}
          />
          <div className="flex-1">
            <Label htmlFor="lgpd" className="text-sm text-gray-600 font-normal">
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
            </Label>
            {errors.lgpd && <p className="text-red-600 text-xs mt-1">{errors.lgpd}</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => handleFormSubmit((data) => {
              const telefoneFormatted = data.telefone ? `${data.ddi}${data.telefone}` : 'Não informado';
              const customSubject = (searchParams as any).subject || '';
              const subject = customSubject || `Contato via página de contato - ${data.nome}`;
              const body = `Email: ${data.email}\\nTelefone: ${telefoneFormatted}\\n\\n${data.mensagem}`;
              window.location.href = `mailto:contato@ameciclo.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            })}
            className="flex-1 bg-[#008080] hover:bg-[#006666] gap-2"
          >
            <Mail size={18} /> Enviar E-mail
          </Button>

          <Button
            type="button"
            onClick={() => handleFormSubmit((data) => {
              const telefoneFormatted = data.telefone ? `${data.ddi}${data.telefone}` : 'Não informado';
              const whatsappMsg = `Olá! Me chamo ${data.nome}!\\n\\nEmail: ${data.email}\\nTelefone: ${telefoneFormatted}\\n\\n${data.mensagem}`;
              window.open(`https://wa.me/5581994586830?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
            })}
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
          >
            <MessageCircle size={18} /> WhatsApp
          </Button>
        </div>
      </form>
    </div>
  );
}
