import { MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";



export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

export default function Contato() {
  const [searchParams] = useSearchParams();
  const initialMessage = searchParams.get("message") || "";

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
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    id="cidade"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    placeholder="Sua cidade"
                  />
                </div>
                
                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    id="mensagem"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                    placeholder="Sua mensagem..."
                    defaultValue={initialMessage}
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="lgpd"
                    className="mt-1 h-4 w-4 text-[#008080] focus:ring-[#008080] border-gray-300 rounded"
                    required
                  />
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
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const lgpdCheckbox = document.getElementById('lgpd') as HTMLInputElement;
                      if (!lgpdCheckbox?.checked) {
                        alert('Por favor, aceite os termos da LGPD para continuar.');
                        return;
                      }
                      const nome = (document.getElementById('nome') as HTMLInputElement)?.value || 'Pessoa interessada';
                      const mensagem = (document.getElementById('mensagem') as HTMLTextAreaElement)?.value || '';
                      const subject = `Contato via Site - ${nome}`;
                      const body = mensagem;
                      window.location.href = `mailto:contato@ameciclo.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                    className="flex-1 bg-[#008080] text-white px-4 py-2 rounded-md hover:bg-[#006666] transition-colors font-medium"
                  >
                    📧 Enviar E-mail
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const lgpdCheckbox = document.getElementById('lgpd') as HTMLInputElement;
                      if (!lgpdCheckbox?.checked) {
                        alert('Por favor, aceite os termos da LGPD para continuar.');
                        return;
                      }
                      const nome = (document.getElementById('nome') as HTMLInputElement)?.value || 'Pessoa interessada';
                      const mensagem = (document.getElementById('mensagem') as HTMLTextAreaElement)?.value || 'Gostaria de saber mais sobre a Ameciclo!';
                      const whatsappMsg = `Olá! Me chamo ${nome}!\n\n${mensagem}`;
                      window.open(`https://wa.me/5581994586830?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    💬 WhatsApp
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
      
      {/* Seção Quem Somos */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Conheça a Ameciclo</h2>
            <p className="text-lg text-gray-600 mb-8">
              Somos uma associação que trabalha pela mobilidade ativa e sustentável na Região Metropolitana do Recife. 
              Conheça nossa história, nossa equipe e como fazemos a diferença na construção de cidades mais humanas.
            </p>
            <a 
              href="/quem_somos" 
              className="inline-flex items-center px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
            >
              Conheça Nossa História
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}