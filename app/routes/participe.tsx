import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Participe from "~/components/Commom/Icones/participe";
import Associe from "~/components/Commom/Icones/associe";
import Apoie from "~/components/Commom/Icones/apoie";
import {
  TelegramIcon,
  CalendarIcon,
  UsersIcon,
  TargetIcon,
  VolunteerIcon,
  ResearchIcon,
  EventIcon,
  TechIcon,
  RobotIcon,
  AlertIcon,
  ToolIcon,
  BikeIcon,
  ShopIcon,
  BookIcon,
  CoffeeIcon,
  ChatIcon,
  BuildingIcon,
  EyeIcon,
  HeartIcon,
  FormIcon,
  InfoIcon
} from "~/components/Commom/Icones/ParticipeIcons";

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
            A Ameciclo é uma associação que trabalha pela mobilidade urbana sustentável 
            e pelo direito à cidade. Existem várias formas de participar e contribuir 
            para um Recife mais ciclável e humano. Fique de olho na nossa agenda e na página inicial 
            do site para avisos de convocação!
          </p>
        </div>

        {/* Cards de Participação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          <motion.div 
            className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-100 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-40 h-40 bg-ameciclo rounded-md flex items-center justify-center">
                <div className="w-32 h-32 text-white">
                  <Participe />
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Envolva-se em nossas atividades, eventos e ações. Sua participação 
              fortalece o movimento cicloativista.
            </p>
            <div className="bg-white/70 rounded-lg p-4 mb-6">
              <ul className="text-left text-gray-700 space-y-2 text-sm">
                <li>• Pesquisas de perfil do ciclista</li>
                <li>• Avaliações cicloviárias</li>
                <li>• Operações de Ghost Bike</li>
                <li>• Grupos de trabalho</li>
              </ul>
            </div>
            <button className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors w-full font-semibold">
              Saiba Mais
            </button>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-40 h-40 bg-ameciclo rounded-md flex items-center justify-center">
                <div className="w-32 h-32 text-white">
                  <Associe />
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Torne-se uma pessoa associada e tenha voz ativa nas decisões 
              da associação.
            </p>
            <div className="bg-white/70 rounded-lg p-4 mb-6">
              <ul className="text-left text-gray-700 space-y-2 text-sm">
                <li>• Participe das assembleias</li>
                <li>• Vote nas decisões importantes</li>
                <li>• Candidate-se para cargos</li>
                <li>• Acesso a grupos exclusivos</li>
              </ul>
            </div>
            <a 
              href="http://queroser.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-block w-full font-semibold"
            >
              Quero me Associar
            </a>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-100 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-40 h-40 bg-ameciclo rounded-md flex items-center justify-center">
                <div className="w-32 h-32 text-white">
                  <Apoie />
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Junte-se ao Clube da Ciclovia! Cada R$15 se transforma em 1 metro 
              de estruturas cicloviárias.
            </p>
            <div className="bg-white/70 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-ameciclo">85% de confiança:</span> Sua contribuição 
                faz diferença real e mensurável na construção de cidades mais sustentáveis!
              </p>
            </div>
            <a 
              href="http://apoie.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-block w-full font-semibold"
            >
              Fazer Doação
            </a>
          </motion.div>
        </div>

        {/* Seção de Formas de Participação */}
        <div className="space-y-16 mb-16">
          {/* Comunicação e Organização */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold text-center mb-8">
              Como nos Organizamos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TelegramIcon className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Telegram</h3>
                </div>
                <p className="mb-4 opacity-90">
                  Nos organizamos principalmente via Telegram. Junte-se aos nossos canais:
                </p>
                <ul className="space-y-2">
                  <li>• <strong>@ameciclobot</strong> - Nosso bot oficial</li>
                  <li>• <strong>t.me/ameciclo</strong> - Canal de notícias</li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Reuniões Ordinárias</h3>
                </div>
                <p className="mb-4 opacity-90">
                  Acontecem toda segunda segunda-feira de cada mês:
                </p>
                <ul className="space-y-2">
                  <li>• Pessoas associadas: direito a fala e voto</li>
                  <li>• Não associadas: direito a observação</li>
                  <li>• Consulte <strong>pautas.ameciclo.org</strong></li>
                  <li>• Veja o <strong>estatuto.ameciclo.org</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grupos de Trabalho */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <UsersIcon className="w-8 h-8 text-ameciclo" />
              <h2 className="text-3xl font-bold text-gray-800">Grupos de Trabalho</h2>
            </div>
            <p className="text-center text-gray-600 mb-8">
              Chamamos pessoas associadas para participar dos grupos de trabalho! 
              Estes grupos são fundamentais para o desenvolvimento dos nossos projetos e ações.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <UsersIcon className="w-5 h-5 text-ameciclo" />
                  <h4 className="font-semibold text-ameciclo">Como Participar</h4>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Seja uma pessoa associada</li>
                  <li>• Participe das reuniões ordinárias</li>
                  <li>• Manifeste interesse em grupos específicos</li>
                  <li>• Contribua com suas habilidades</li>
                </ul>
              </div>
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <TargetIcon className="w-5 h-5 text-ameciclo" />
                  <h4 className="font-semibold text-ameciclo">Áreas de Atuação</h4>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Mobilidade e infraestrutura</li>
                  <li>• Comunicação e educação</li>
                  <li>• Eventos e ações</li>
                  <li>• Pesquisa e dados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Voluntariado */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-center gap-4 mb-8">
              <VolunteerIcon className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Voluntariado</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ResearchIcon className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Pesquisa e Avaliação</h3>
                </div>
                <ul className="space-y-3">
                  <li>• Pesquisas de perfil do ciclista</li>
                  <li>• Avaliação cicloviária voluntária</li>
                  <li>• Coleta de dados de mobilidade</li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <EventIcon className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Ações e Eventos</h3>
                </div>
                <ul className="space-y-3">
                  <li>• Operações de Ghost Bike</li>
                  <li>• Organização de eventos</li>
                  <li>• Campanhas educativas</li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TechIcon className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Habilidades Técnicas</h3>
                </div>
                <ul className="space-y-3">
                  <li>• Design e comunicação</li>
                  <li>• Programação e tecnologia</li>
                  <li>• Produção de conteúdo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ferramentas de Denúncia */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <RobotIcon className="w-8 h-8 text-gray-800" />
              <h2 className="text-3xl font-bold text-gray-800">Bicibot (BETA) - Denuncie Infrações</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-gray-600 mb-6">
                Denuncie motoristas infratores ou lugares que demandam manutenções na infraestrutura cicloviária.
              </p>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg mb-6 border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertIcon className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-600">O que é a Bicibot?</h4>
                </div>
                <p className="text-gray-700 mb-4">
                  Uma assistente criada para ajudar ciclistas a denunciarem situações de risco no trânsito. 
                  Nasceu da parceria entre a Ameciclo (Recife) e a Ciclocidade (São Paulo).
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ToolIcon className="w-4 h-4 text-red-700" />
                      <h5 className="font-medium text-red-700">Como Funciona:</h5>
                    </div>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Chatbot no ChatGPT</li>
                      <li>• Acesse: bicibot.ameciclo.org</li>
                      <li>• Coleta dados organizados</li>
                      <li>• Base de dados pública</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <InfoIcon className="w-4 h-4 text-orange-700" />
                      <h5 className="font-medium text-orange-700">Informações Coletadas:</h5>
                    </div>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Placa ou identificação do veículo</li>
                      <li>• Endereço do ocorrido</li>
                      <li>• Data e horário</li>
                      <li>• Relato da situação</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <a 
                  href="https://bicibot.ameciclo.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 inline-block mr-4 font-semibold shadow-lg"
                >
                  🚨 Acessar Bicibot
                </a>
                <p className="text-sm text-gray-600 mt-4 bg-white/50 p-3 rounded-lg">
                  <strong>Funciona no Brasil todo!</strong> Registre situações e ajude a mostrar onde o bicho pega para quem pedala.
                </p>
              </div>
            </div>
          </div>

          {/* Nossa Sede */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <BuildingIcon className="w-8 h-8 text-gray-800" />
              <h2 className="text-3xl font-bold text-gray-800">Nossa Sede</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <ToolIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-600">Oficina Solidária</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Faça serviços gratuitos com suas próprias mãos! Temos mecânico para ajudar 
                  ou fazer serviços remunerados quando necessário.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Manutenção básica gratuita</li>
                  <li>• Apoio técnico disponível</li>
                  <li>• Serviços especializados pagos</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <BikeIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-600">Doação de Bicicletas</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Doe bicicletas ou peças! Usamos as doações na oficina mecânica 
                  e no projeto Bota pra Rodar.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Bicicletas em qualquer estado</li>
                  <li>• Peças e acessórios</li>
                  <li>• Destinação para projetos sociais</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <ShopIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-purple-600">Lojinha</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Temos camisas, adesivos e spokecards da Ameciclo!
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Camisas exclusivas</li>
                  <li>• Adesivos temáticos</li>
                  <li>• Spokecards personalizados</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <BookIcon className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-indigo-600">Biblioteca</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Biblioteca com vários livros sobre mobilidade e cicloativismo.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Livros especializados</li>
                  <li>• Material de pesquisa</li>
                  <li>• Consulta local</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <CoffeeIcon className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-semibold text-orange-600">Comodidades</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Venha tomar um cafezinho, usar o banheiro ou até tomar banho!
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Café sempre fresquinho</li>
                  <li>• Banheiro disponível</li>
                  <li>• Chuveiro para ciclistas</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <ChatIcon className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-semibold text-pink-600">Troca de Ideias</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Vá lá trocar uma ideia sobre mobilidade, contar uma situação 
                  que passou ou conhecer as pessoas da Ameciclo!
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Ambiente acolhedor</li>
                  <li>• Pessoas engajadas</li>
                  <li>• Networking cicloativista</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <BuildingIcon className="w-5 h-5 text-green-700" />
                <h4 className="text-lg font-semibold text-green-700">Programa Ocupe a Sede</h4>
              </div>
              <p className="text-gray-700 mb-4">
                Quer compartilhar o ambiente da nossa sede? Acesse <strong>ocupe.ameciclo.org</strong>, 
                preencha o formulário e aguarde nossa resposta!
              </p>
              <a 
                href="https://ocupe.ameciclo.org"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 inline-block font-semibold shadow-lg"
              >
                <FormIcon className="w-4 h-4 mr-2" />Acessar Formulário
              </a>
            </div>
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="bg-gradient-to-r from-ameciclo to-teal-700 text-white rounded-xl p-8 text-center shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <EyeIcon className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Fique de Olho na Agenda!</h2>
          </div>
          <p className="text-lg mb-6">
            Acompanhe todos os eventos da Ameciclo através da nossa agenda e da página inicial 
            do site para não perder nenhuma convocação ou atividade.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <a 
              href="/agenda"
              className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 text-center font-semibold border border-white/30"
            >
              📅 Ver Agenda
            </a>
            <a 
              href="https://t.me/ameciclo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 text-center font-semibold border border-white/30"
            >
              📱 Canal Telegram
            </a>
            <a 
              href="/contato"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-ameciclo transition-all duration-300 text-center font-semibold"
            >
              💬 Fale Conosco
            </a>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center mt-16 bg-gradient-to-br from-gray-50 to-teal-50 p-12 rounded-xl">
          <div className="flex items-center justify-center gap-4 mb-6">
            <HeartIcon className="w-10 h-10 text-gray-800" />
            <h2 className="text-4xl font-bold text-gray-800">Juntos Construímos um Recife Mais Ciclável</h2>
          </div>
          <p className="text-lg text-gray-600 mb-8">
            Cada pessoa que se junta à Ameciclo fortalece nossa luta por uma cidade 
            mais sustentável, segura e humana. Como associação, suas decisões são tomadas 
            coletivamente por pessoas associadas. Sua participação faz a diferença!
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
            <a 
              href="http://queroser.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-ameciclo to-teal-700 text-white px-10 py-5 rounded-xl text-lg font-bold hover:from-teal-700 hover:to-ameciclo transition-all duration-300 text-center shadow-xl transform hover:scale-105"
            >
              🤝 Associar-se Agora
            </a>
            <a 
              href="http://apoie.ameciclo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-3 border-ameciclo text-ameciclo px-10 py-5 rounded-xl text-lg font-bold hover:bg-ameciclo hover:text-white transition-all duration-300 text-center shadow-xl transform hover:scale-105"
            >
              💝 Fazer Doação
            </a>
          </div>
        </div>
      </div>
    </>
  );
}