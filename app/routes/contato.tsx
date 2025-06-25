import { MetaFunction } from "@remix-run/node";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";



export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

export default function Contato() {

  return (
    <>
      <Banner image={bannerContatact} alt="Mulher negra de cabelo crespo volumoso andando de bicicleta com camisa branca de costas no canto direito do banner, passando ao lado de um bicicletário com várias bicicletas e cones que protegem este bicicletário" />
      <Breadcrumb label="Contato" slug="/contato" routes={["/"]} />
      <section className="container mx-auto my-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Entre em Contato</h1>
            <p className="text-lg text-gray-600">Estamos aqui para ouvir você e construir juntos uma cidade mais humana e sustentável.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Informações de Contato */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-ameciclo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
                    <p className="text-gray-600">R. da Aurora, 529, loja 2<br />Santo Amaro, Recife/PE<br />CEP: 50050-145</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-ameciclo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Telefone</h3>
                    <p className="text-gray-600">+55 (81) 9 9458-6830</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-ameciclo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">E-mail</h3>
                    <p className="text-gray-600">contato@ameciclo.org</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formas de Participação */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Como Participar</h2>
              
              <div className="space-y-4">
                <a href="/participe" className="block p-4 border border-gray-200 rounded-lg hover:border-ameciclo hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-medium text-ameciclo mb-2">Participe</h3>
                  <p className="text-gray-600 text-sm">Descubra as diferentes formas de se envolver com a Ameciclo e ajudar a construir uma cidade melhor.</p>
                </a>

                <a href="http://queroser.ameciclo.org" target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:border-ameciclo hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-medium text-ameciclo mb-2">Associe-se</h3>
                  <p className="text-gray-600 text-sm">Torne-se uma pessoa associada e fortaleça o movimento cicloativista na região metropolitana do Recife.</p>
                </a>

                <a href="http://apoie.ameciclo.org" target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:border-ameciclo hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-medium text-ameciclo mb-2">Apoie</h3>
                  <p className="text-gray-600 text-sm">Contribua financeiramente para manter e expandir nossas atividades e projetos.</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full h-96 mb-8">
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
      </section>
    </>
  );
}