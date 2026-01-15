import { MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { Mail, MessageCircle, Check, X } from "lucide-react";
import { useState } from "react";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";



export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

export default function Contato() {
  const [searchParams] = useSearchParams();
  const initialMessage = searchParams.get("message") || "";
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<{[key: string]: boolean}>({});

  return (
    <>
      <Banner image={bannerContatact} alt="Mulher negra de cabelo crespo volumoso andando de bicicleta com camisa branca de costas no canto direito do banner, passando ao lado de um bicicletário com várias bicicletas e cones que protegem este bicicletário" />
      <Breadcrumb label="Contato" slug="/contato" routes={["/"]} />
      <section className="container mx-auto my-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formas de Participação */}
            <div className="bg-white rounded-lg shadow-lg p-8 order-1">
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
                      aria-invalid={!!errors.nome}
                      aria-describedby={errors.nome ? "nome-error" : success.nome ? "nome-success" : undefined}
                      aria-live="polite"
                      onChange={(e) => {
                        const value = e.target.value;
                        setErrors(prev => ({...prev, nome: ''}));
                        setSuccess(prev => ({...prev, nome: value.length > 0}));
                      }}
                    />
                    {errors.nome && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" aria-hidden="true" />}
                    {success.nome && !errors.nome && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" aria-hidden="true" />}
                  </div>
                  {errors.nome && <p id="nome-error" className="text-red-600 text-xs mt-1" role="alert">{errors.nome}</p>}
                  {success.nome && !errors.nome && <p id="nome-success" className="sr-only">Nome válido</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent ${errors.email ? 'border-red-500 bg-red-50' : success.email ? 'border-green-500' : 'border-gray-300'}`}
                      placeholder="seu@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : success.email ? "email-success" : undefined}
                      aria-live="polite"
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
                    {errors.email && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" aria-hidden="true" />}
                    {success.email && !errors.email && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" aria-hidden="true" />}
                  </div>
                  {errors.email && <p id="email-error" className="text-red-600 text-xs mt-1" role="alert">{errors.email}</p>}
                  {success.email && !errors.email && <p id="email-success" className="sr-only">Email válido</p>}
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
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+351">🇵🇹 +351</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+51">🇵🇪 +51</option>
                      <option value="+598">🇺🇾 +598</option>
                      <option value="+595">🇵🇾 +595</option>
                      <option value="+591">🇧🇴 +591</option>
                      <option value="+593">🇪🇨 +593</option>
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+507">🇵🇦 +507</option>
                      <option value="+506">🇨🇷 +506</option>
                      <option value="+503">🇸🇻 +503</option>
                      <option value="+502">🇬🇹 +502</option>
                      <option value="+504">🇭🇳 +504</option>
                      <option value="+505">🇳🇮 +505</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+64">🇳🇿 +64</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+254">🇰🇪 +254</option>
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+82">🇰🇷 +82</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+66">🇹🇭 +66</option>
                      <option value="+84">🇻🇳 +84</option>
                      <option value="+63">🇵🇭 +63</option>
                      <option value="+62">🇮🇩 +62</option>
                      <option value="+7">🇷🇺 +7</option>
                      <option value="+380">🇺🇦 +380</option>
                      <option value="+48">🇵🇱 +48</option>
                      <option value="+31">🇳🇱 +31</option>
                      <option value="+32">🇧🇪 +32</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+43">🇦🇹 +43</option>
                      <option value="+45">🇩🇰 +45</option>
                      <option value="+46">🇸🇪 +46</option>
                      <option value="+47">🇳🇴 +47</option>
                      <option value="+358">🇫🇮 +358</option>
                      <option value="+353">🇮🇪 +353</option>
                      <option value="+30">🇬🇷 +30</option>
                      <option value="+90">🇹🇷 +90</option>
                      <option value="+972">🇮🇱 +972</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        id="telefone"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent ${errors.telefone ? 'border-red-500 bg-red-50' : success.telefone ? 'border-green-500' : 'border-gray-300'}`}
                        placeholder="81912345678"
                        aria-invalid={!!errors.telefone}
                        aria-describedby={errors.telefone ? "telefone-error" : success.telefone ? "telefone-success" : undefined}
                        aria-live="polite"
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
                      {errors.telefone && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" aria-hidden="true" />}
                      {success.telefone && !errors.telefone && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" aria-hidden="true" />}
                    </div>
                  </div>
                  {errors.telefone && <p id="telefone-error" className="text-red-600 text-xs mt-1" role="alert">{errors.telefone}</p>}
                  {success.telefone && !errors.telefone && <p id="telefone-success" className="sr-only">Telefone válido</p>}
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
                      aria-invalid={!!errors.mensagem}
                      aria-describedby={errors.mensagem ? "mensagem-error" : success.mensagem ? "mensagem-success" : undefined}
                      aria-live="polite"
                      onChange={(e) => {
                        const value = e.target.value;
                        setErrors(prev => ({...prev, mensagem: ''}));
                        setSuccess(prev => ({...prev, mensagem: value.length > 0}));
                      }}
                    />
                    {errors.mensagem && <X size={18} className="absolute right-3 top-3 text-red-600" aria-hidden="true" />}
                    {success.mensagem && !errors.mensagem && <Check size={18} className="absolute right-3 top-3 text-green-600" aria-hidden="true" />}
                  </div>
                  {errors.mensagem && <p id="mensagem-error" className="text-red-600 text-xs mt-1" role="alert">{errors.mensagem}</p>}
                  {success.mensagem && !errors.mensagem && <p id="mensagem-success" className="sr-only">Mensagem válida</p>}
                </div>
                
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="lgpd"
                    className={`mt-1 h-4 w-4 text-[#008080] focus:ring-[#008080] border-gray-300 rounded ${errors.lgpd ? 'border-red-500' : ''}`}
                    required
                    aria-invalid={!!errors.lgpd}
                    aria-describedby={errors.lgpd ? "lgpd-error" : undefined}
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
                    {errors.lgpd && <p id="lgpd-error" className="text-red-600 text-xs mt-1" role="alert">{errors.lgpd}</p>}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newErrors: {[key: string]: string} = {};
                      const lgpdCheckbox = document.getElementById('lgpd') as HTMLInputElement;
                      const email = (document.getElementById('email') as HTMLInputElement)?.value;
                      const nome = (document.getElementById('nome') as HTMLInputElement)?.value;
                      const mensagem = (document.getElementById('mensagem') as HTMLTextAreaElement)?.value;
                      const telefone = (document.getElementById('telefone') as HTMLInputElement)?.value;
                      
                      if (!nome) newErrors.nome = 'Nome é obrigatório';
                      if (!email) {
                        newErrors.email = 'Email é obrigatório';
                      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        newErrors.email = 'Email inválido';
                      }
                      if (telefone && !/^\d{10,11}$/.test(telefone.replace(/\D/g, ''))) {
                        newErrors.telefone = 'Telefone inválido';
                      }
                      if (!mensagem) newErrors.mensagem = 'Mensagem é obrigatória';
                      if (!lgpdCheckbox?.checked) newErrors.lgpd = 'Você precisa aceitar os termos da LGPD';
                      
                      if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                        document.getElementById(Object.keys(newErrors)[0])?.focus();
                        return;
                      }
                      
                      setErrors({});
                      const ddi = (document.getElementById('ddi') as HTMLSelectElement)?.value || '+55';
                      const telefoneFormatted = telefone ? `${ddi}${telefone}` : 'Não informado';
                      const urlParams = new URLSearchParams(window.location.search);
                      const customSubject = urlParams.get('subject');
                      const subject = customSubject || `Contato via página de contato - ${nome}`;
                      const body = `Email: ${email}\nTelefone: ${telefoneFormatted}\n\n${mensagem}`;
                      window.location.href = `mailto:contato@ameciclo.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                    className="flex-1 bg-[#008080] text-white px-4 py-2 rounded-md hover:bg-[#006666] transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Mail size={18} /> Enviar E-mail
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newErrors: {[key: string]: string} = {};
                      const lgpdCheckbox = document.getElementById('lgpd') as HTMLInputElement;
                      const email = (document.getElementById('email') as HTMLInputElement)?.value;
                      const nome = (document.getElementById('nome') as HTMLInputElement)?.value;
                      const mensagem = (document.getElementById('mensagem') as HTMLTextAreaElement)?.value;
                      const telefone = (document.getElementById('telefone') as HTMLInputElement)?.value;
                      
                      if (!nome) newErrors.nome = 'Nome é obrigatório';
                      if (!email) {
                        newErrors.email = 'Email é obrigatório';
                      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        newErrors.email = 'Email inválido';
                      }
                      if (telefone && !/^\d{10,11}$/.test(telefone.replace(/\D/g, ''))) {
                        newErrors.telefone = 'Telefone inválido';
                      }
                      if (!mensagem) newErrors.mensagem = 'Mensagem é obrigatória';
                      if (!lgpdCheckbox?.checked) newErrors.lgpd = 'Você precisa aceitar os termos da LGPD';
                      
                      if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                        document.getElementById(Object.keys(newErrors)[0])?.focus();
                        return;
                      }
                      
                      setErrors({});
                      const ddi = (document.getElementById('ddi') as HTMLSelectElement)?.value || '+55';
                      const telefoneFormatted = telefone ? `${ddi}${telefone}` : 'Não informado';
                      const whatsappMsg = `Olá! Me chamo ${nome}!\n\nEmail: ${email}\nTelefone: ${telefoneFormatted}\n\n${mensagem}`;
                      window.open(`https://wa.me/5581994586830?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </button>
                </div>
              </form>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden order-2 md:order-2 lg:order-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.2847!2d-34.8823!3d-8.0593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab18a59c7b4b0b%3A0x123456789!2sR.%20da%20Aurora%2C%20529%20-%20Santo%20Amaro%2C%20Recife%20-%20PE!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Sede da Ameciclo"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}