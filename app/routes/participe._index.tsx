import { MetaFunction } from "@remix-run/node";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Participe from "~/components/Commom/Icones/participe";
import Associe from "~/components/Commom/Icones/associe";
import Apoie from "~/components/Commom/Icones/apoie";
import { EyeIcon } from "~/components/Commom/Icones/ParticipeIcons";
import AccessibilityControls from "~/components/Commom/AccessibilityControls";
import ChangeThemeButton from "~/components/Commom/ChangeThemeButton";
import { ParticipationCard } from "~/components/Participe/ParticipationCard";
import { OrganizationSection } from "~/components/Participe/OrganizationSection";
import { WorkGroupsSection } from "~/components/Participe/WorkGroupsSection";
import { VolunteerSection } from "~/components/Participe/VolunteerSection";
import { BicibotSection } from "~/components/Participe/BicibotSection";
import { HeadquartersSection } from "~/components/Participe/HeadquartersSection";
import { OpenSourceSection } from "~/components/Participe/OpenSourceSection";
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
          <ParticipationCard
            icon={<Participe />}
            description="Envolva-se em nossas atividades, eventos e ações. Sua participação fortalece o movimento cicloativista."
            items={[
              "• Pesquisas de perfil do ciclista",
              "• Avaliações cicloviárias",
              "• Operações de Ghost Bike",
              "• Grupos de trabalho"
            ]}
            buttonText="Saiba Mais"
            buttonOnClick={() => {
              const element = document.getElementById('como-nos-organizamos');
              if (element) {
                const offsetTop = element.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }
            }}
            darkMode={darkMode}
            fontSize={fontSize}
            gradientFrom="from-teal-50"
            gradientTo="to-cyan-50"
            borderColor="border-teal-100"
          />

          <ParticipationCard
            icon={<Associe />}
            description="Torne-se uma pessoa associada e tenha voz ativa nas decisões da associação."
            items={[
              "• Participe das assembleias",
              "• Vote nas decisões importantes",
              "• Candidate-se para cargos",
              "• Acesso a grupos exclusivos"
            ]}
            buttonText="Quero me Associar"
            buttonHref="http://queroser.ameciclo.org"
            darkMode={darkMode}
            fontSize={fontSize}
            gradientFrom="from-emerald-50"
            gradientTo="to-teal-50"
            borderColor="border-emerald-100"
          />

          <ParticipationCard
            icon={<Apoie />}
            description="Junte-se ao Clube da Ciclovia! Cada R$15 se transforma em 1 metro de estruturas cicloviárias."
            items={[
              "R$15+: Cada R$15 vira 1 metro de estrutura cicloviária",
              "R$25+: Acesso ao Clube da Ciclovia +10.000 parceiros",
              "R$30+: Apoiadoras da Revolução",
              "R$125+: Parceiros da Revolução"
            ]}
            buttonText="Fazer Doação"
            buttonHref="http://apoie.ameciclo.org"
            darkMode={darkMode}
            fontSize={fontSize}
            gradientFrom="from-cyan-50"
            gradientTo="to-blue-50"
            borderColor="border-cyan-100"
          />
        </div>


        <div className="space-y-12 lg:space-y-16 mb-12 lg:mb-16">
          <OrganizationSection />
          <WorkGroupsSection darkMode={darkMode} />
          <VolunteerSection />
          <BicibotSection darkMode={darkMode} fontSize={fontSize} />
          <HeadquartersSection darkMode={darkMode} fontSize={fontSize} />
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

        <OpenSourceSection darkMode={darkMode} />

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