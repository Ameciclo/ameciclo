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
import AccessibilityControls from "~/components/Commom/AccessibilityControls";
import ChangeThemeButton from "~/components/Commom/ChangeThemeButton";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Participe - Ameciclo" }];
};

export default function ParticiparPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    let styleElement = document.getElementById('high-contrast-styles');
    if (highContrast && !styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'high-contrast-styles';
      styleElement.innerHTML = `
        .high-contrast * { color: #000 !important; background-color: #fff !important; border-color: #000 !important; }
        .high-contrast.dark * { color: #fff !important; background-color: #000 !important; border-color: #fff !important; }
        .high-contrast .text-green-500, .high-contrast .text-green-700 { color: #006600 !important; font-weight: bold; }
        .high-contrast.dark .text-green-500, .high-contrast.dark .text-green-700 { color: #00ff00 !important; font-weight: bold; }
        .high-contrast .text-red-500 { color: #cc0000 !important; font-weight: bold; }
        .high-contrast.dark .text-red-500 { color: #ff0000 !important; font-weight: bold; }
        .high-contrast .text-blue-500 { color: #0000cc !important; font-weight: bold; }
        .high-contrast.dark .text-blue-500 { color: #0099ff !important; font-weight: bold; }
      `;
      document.head.appendChild(styleElement);
    } else if (!highContrast && styleElement) {
      styleElement.remove();
    }
  }, [highContrast, darkMode]);

  useEffect(() => {
    document.body.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Banner image="/projetos.webp" alt="Participe da Ameciclo" />
      <Breadcrumb label="Participe" slug="/participe" routes={["/"]} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        <div className="text-center mb-12 lg:mb-16">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Faça Parte da Mudança
          </h1>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A Ameciclo é uma associação que trabalha pela mobilidade urbana sustentável 
            e pelo direito à cidade. Existem várias formas de participar e contribuir 
            para um Recife mais ciclável e humano. Fique de olho na nossa agenda e na página inicial 
            do site para avisos de convocação!
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <motion.div 
            className={`border-2 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100'}`}
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

            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-6`}>
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
            <button 
              onClick={() => {
                const element = document.getElementById('como-nos-organizamos');
                if (element) {
                  const offsetTop = element.offsetTop - 80;
                  window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
              }}
              className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors w-full font-semibold"
            >
              Saiba Mais
            </button>
          </motion.div>

          <motion.div 
            className={`border-2 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'}`}
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

            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-6`}>
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
            className={`border-2 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100'}`}
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

            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-6`}>
              Junte-se ao Clube da Ciclovia! Cada R$15 se transforma em 1 metro 
              de estruturas cicloviárias.
            </p>
            <div className="bg-white/70 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-ameciclo">85% dos recursos para 85% da população:</span> 
                Defendemos que a maior parte do orçamento público de mobilidade seja destinada 
                aos modos sustentáveis - bicicleta, caminhada e transporte coletivo - que 
                representam a maioria das pessoas que se deslocam na cidade!
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


        <div className="space-y-12 lg:space-y-16 mb-12 lg:mb-16">

          <div id="como-nos-organizamos" className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
              Como nos Organizamos
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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


          <div className={`border rounded-xl shadow-lg p-8 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'}`}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <UsersIcon className="w-8 h-8 text-ameciclo" />
              <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Grupos de Trabalho</h2>
            </div>
            <p className={`text-center mb-6 sm:mb-8 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Chamamos pessoas associadas para participar dos grupos de trabalho! 
              Estes grupos são fundamentais para o desenvolvimento dos nossos projetos e ações. 
              Acesse <a href="https://gts.ameciclo.org" target="_blank" rel="noopener noreferrer" className="text-ameciclo font-semibold hover:underline">gts.ameciclo.org</a> para ver todos os grupos.
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


          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-center gap-4 mb-8">
              <VolunteerIcon className="w-8 h-8" />
              <h2 className="text-2xl sm:text-3xl font-bold">Voluntariado</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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


          <div className={`border-2 rounded-xl shadow-lg p-8 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'}`}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <RobotIcon className="w-8 h-8 text-gray-800" />
              <h2 className={`text-2xl sm:text-3xl font-bold text-center sm:text-left ${darkMode ? 'text-white' : 'text-gray-800'}`}>Bicibot (BETA) - Denuncie Infrações</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className={`text-center mb-6 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Denuncie motoristas infratores ou lugares que demandam manutenções na infraestrutura cicloviária.
              </p>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg mb-6 border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertIcon className="w-5 h-5 text-purple-800" />
                  <h4 className="font-semibold text-purple-800">O que é a Bicibot?</h4>
                </div>
                <p className={`mb-4 ${darkMode ? 'text-black' : 'text-gray-700'}`}>
                  Uma assistente criada para ajudar ciclistas a denunciarem situações de risco no trânsito. 
                  Nasceu da parceria entre a Ameciclo (Recife) e a Ciclocidade (São Paulo).
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-grey' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ToolIcon className="w-4 h-4 text-red-700" />
                      <h5 className={`font-medium ${darkMode ? 'text-red-900' : 'text-red-700'}`}>Como Funciona:</h5>
                    </div>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Chatbot no ChatGPT</li>
                      <li>• Acesse: bicibot.ameciclo.org</li>
                      <li>• Coleta dados organizados</li>
                      <li>• Base de dados pública</li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-grey' : 'bg-orange-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <InfoIcon className="w-4 h-4 text-orange-700" />
                      <h5 className={`font-medium ${darkMode ? 'text-orange-900' : 'text-orange-700'}`}>Informações Coletadas:</h5>
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
                  className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:from-purple-600 hover:to-purple-800 transition-all duration-300 inline-block mb-4 sm:mb-0 sm:mr-4 font-semibold shadow-lg text-center w-full sm:w-auto"
                >
                  🚨 Acessar Bicibot
                </a>
                <p className={`text-sm mt-4 p-3 rounded-lg ${darkMode ? 'text-gray-300 bg-gray-800/50' : 'text-gray-600 bg-white/50'}`}>
                  <strong>Funciona no Brasil todo!</strong> Registre situações e ajude a mostrar onde o bicho pega para quem pedala.
                </p>
              </div>
            </div>
          </div>


          <div className={`border-2 rounded-xl shadow-lg p-8 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'}`}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <BuildingIcon className="w-8 h-8 text-gray-800" />
              <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-600'}`}>Nossa Sede</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <ChatIcon className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-semibold text-pink-600">Troca de Ideias e Apoio</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Venha conhecer nosso funcionamento, trocar ideias sobre mobilidade, conhecer nossos projetos!
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Conheça nosso funcionamento</li>
                  <li>• Troca de ideias sobre mobilidade</li>
                  <li>• Registro de ocorrências via Bicibot</li>
                  <li>• Networking cicloativista</li>
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
                  <ToolIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-600">Oficina Solidária</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Ferramentas disponíveis para uso gratuito no local! Temos mecânico para ajudar 
                  ou fazer serviços remunerados quando necessário.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Ferramentas gratuitas para uso local</li>
                  <li>• Apoio técnico disponível</li>
                  <li>• Serviços especializados pagos</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <ShopIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-purple-600">Lojinha</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Temos camisas, adesivos, spokecards, ímãs de geladeira e copos retráteis!
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Camisas exclusivas</li>
                  <li>• Adesivos e spokecards</li>
                  <li>• Ímãs de geladeira</li>
                  <li>• Copos de borracha retrátil</li>
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
                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 inline-flex items-center font-semibold shadow-lg"
              >
                <FormIcon className="w-4 h-4 mr-2" />Acessar Formulário
              </a>
            </div>
          </div>
        </div>


        <div className="bg-gradient-to-r from-ameciclo to-teal-700 text-white rounded-xl p-8 text-center shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <EyeIcon className="w-8 h-8" />
            <h2 className="text-2xl sm:text-3xl font-bold">Fique de Olho na Agenda!</h2>
          </div>
          <p className="text-base sm:text-lg mb-6 px-4">
            Acompanhe todos os eventos da Ameciclo através da nossa agenda e da página inicial 
            do site para não perder nenhuma convocação ou atividade.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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


      </div>
      
      <AccessibilityControls
        darkMode={darkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        showAccessibilityMenu={showAccessibilityMenu}
        setShowAccessibilityMenu={setShowAccessibilityMenu}
        showScrollTop={showScrollTop}
        onScrollTop={scrollToTop}
      />
      <ChangeThemeButton
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
}