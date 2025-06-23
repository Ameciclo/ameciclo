import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Participe from "~/components/Commom/Icones/participe";
import Associe from "~/components/Commom/Icones/associe";
import Apoie from "~/components/Commom/Icones/apoie";

export const meta: MetaFunction = () => {
  return [{ title: "Participe - Ameciclo" }];
};

export default function ParticiparPage() {
  return (
    <>
      <Banner image="/projetos.webp" alt="Participe da Ameciclo" />
      <Breadcrumb label="Participe" slug="/participe" routes={["/"]} />
      
      <div className="container mx-auto px-4 py-12">
        {/* Seção Principal */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Faça Parte da Mudança
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A Ameciclo é uma organização que trabalha pela mobilidade urbana sustentável 
            e pelo direito à cidade. Existem várias formas de participar e contribuir 
            para um Recife mais ciclável e humano.
          </p>
        </div>

        {/* Cards de Participação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                <Participe />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-ameciclo mb-4">Participe</h2>
            <p className="text-gray-600 mb-6">
              Envolva-se em nossas atividades, eventos e ações. Sua participação 
              fortalece o movimento cicloativista.
            </p>
            <ul className="text-left text-gray-700 space-y-2 mb-6">
              <li>• Participe de eventos e pedaladas</li>
              <li>• Contribua com contagens de ciclistas</li>
              <li>• Ajude em campanhas educativas</li>
              <li>• Participe de reuniões abertas</li>
            </ul>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                <Associe />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-ameciclo mb-4">Associe-se</h2>
            <p className="text-gray-600 mb-6">
              Torne-se uma pessoa associada e tenha voz ativa nas decisões 
              da organização.
            </p>
            <ul className="text-left text-gray-700 space-y-2 mb-6">
              <li>• Participe das assembleias</li>
              <li>• Vote nas decisões importantes</li>
              <li>• Candidate-se para cargos</li>
              <li>• Acesso a grupos exclusivos</li>
            </ul>
            <a 
              href="http://queroser.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors inline-block"
            >
              Quero me Associar
            </a>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                <Apoie />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-ameciclo mb-4">Apoie</h2>
            <p className="text-gray-600 mb-6">
              Contribua financeiramente para manter e expandir nossos projetos 
              e ações.
            </p>
            <ul className="text-left text-gray-700 space-y-2 mb-6">
              <li>• Doações mensais ou pontuais</li>
              <li>• Financiamento coletivo</li>
              <li>• Patrocínio de eventos</li>
              <li>• Compra de produtos Ameciclo</li>
            </ul>
            <a 
              href="http://apoie.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors inline-block"
            >
              Fazer Doação
            </a>
          </motion.div>
        </div>

        {/* Seção de Formas de Participação */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Outras Formas de Participar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-xl font-semibold text-ameciclo mb-4">Voluntariado</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Ajude na organização de eventos e pedaladas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Contribua com habilidades técnicas (design, programação, comunicação)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Participe de grupos de trabalho específicos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Ajude na produção de conteúdo e materiais educativos</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-ameciclo mb-4">Advocacy e Mobilização</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Participe de audiências públicas e consultas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Compartilhe nossas campanhas nas redes sociais</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Relate problemas de infraestrutura cicloviária</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ameciclo mr-2">•</span>
                  <span>Mobilize sua comunidade para a causa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="bg-ameciclo text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Vamos Conversar?</h2>
          <p className="text-lg mb-6">
            Tem dúvidas sobre como participar? Entre em contato conosco!
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <a 
              href="mailto:contato@ameciclo.org"
              className="bg-white text-ameciclo px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              contato@ameciclo.org
            </a>
            <a 
              href="https://instagram.com/ameciclo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-ameciclo px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              @ameciclo
            </a>
            <a 
              href="/contato"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-ameciclo transition-colors text-center"
            >
              Página de Contato
            </a>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Juntos Construímos um Recife Mais Ciclável
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Cada pessoa que se junta à Ameciclo fortalece nossa luta por uma cidade 
            mais sustentável, segura e humana. Sua participação faz a diferença!
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <a 
              href="http://queroser.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ameciclo text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
            >
              Associar-se Agora
            </a>
            <a 
              href="http://apoie.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-ameciclo text-ameciclo px-8 py-4 rounded-lg text-lg font-semibold hover:bg-ameciclo hover:text-white transition-colors text-center"
            >
              Fazer Doação
            </a>
          </div>
        </div>
      </div>
    </>
  );
}