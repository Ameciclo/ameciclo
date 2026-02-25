import { Bike } from "lucide-react";

interface ProjectStepsProps {
  currentSlug?: string;
}

const translations = {
  pt: {
    step: "PASSO",
    steps: [
      {
        number: 1,
        title: "Campanha de Recolhimento",
        description: "Campanha para recolher bicicletas sem utilização em condomínios e casas",
      },
      {
        number: 2,
        title: "Integração Comunitária",
        description: "Integração e discussão com a comunidade para a construção do sistema",
      },
      {
        number: 3,
        title: "Oficinas de Mecânica",
        description: "Realização de oficinas de mecânica com a juventude das comunidades",
      },
      {
        number: 4,
        title: "Sistema Compartilhado",
        description: "Criação de um sistema de bicicletas compartilhadas gerido pela comunidade",
      },
    ],
    donationButton: "Formulário de Doação",
  },
  en: {
    step: "STEP",
    steps: [
      {
        number: 1,
        title: "Collection Campaign",
        description: "Campaign to collect unused bicycles from condominiums and houses",
      },
      {
        number: 2,
        title: "Community Integration",
        description: "Integration and discussion with the community to build the system",
      },
      {
        number: 3,
        title: "Mechanics Workshops",
        description: "Conducting mechanics workshops with youth from the communities",
      },
      {
        number: 4,
        title: "Shared System",
        description: "Creation of a community-managed bicycle sharing system",
      },
    ],
    donationButton: "Donation Form",
  },
  es: {
    step: "PASO",
    steps: [
      {
        number: 1,
        title: "Campaña de Recolección",
        description: "Campaña para recoger bicicletas sin uso en condominios y casas",
      },
      {
        number: 2,
        title: "Integración Comunitaria",
        description: "Integración y discusión con la comunidad para la construcción del sistema",
      },
      {
        number: 3,
        title: "Talleres de Mecánica",
        description: "Realización de talleres de mecánica con la juventud de las comunidades",
      },
      {
        number: 4,
        title: "Sistema Compartido",
        description: "Creación de un sistema de bicicletas compartidas gestionado por la comunidad",
      },
    ],
    donationButton: "Formulario de Donación",
  },
};

const images = [
  "https://res.cloudinary.com/plpbs/image/upload/v1615154368/botaprarodar1_c5699a2352.png",
  "https://res.cloudinary.com/plpbs/image/upload/v1615154054/botaprarodar2_c9a3b5debe.png",
  "https://res.cloudinary.com/plpbs/image/upload/v1615154054/botaprarodar3_69470abc97.png",
  "https://res.cloudinary.com/plpbs/image/upload/v1615154408/botaprarodar4_3652e7a970.png",
];

export function ProjectSteps({ currentSlug = "bota_pra_rodar" }: ProjectStepsProps) {
  // Detectar idioma atual
  let lang: 'pt' | 'en' | 'es' = 'pt';
  if (currentSlug.endsWith('_en')) {
    lang = 'en';
  } else if (currentSlug.endsWith('_es')) {
    lang = 'es';
  }

  const t = translations[lang];
  return (
    <section className="container mx-auto my-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {t.steps.map((step, index) => (
          <div
            key={step.number}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={images[index]}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-center mb-3 text-gray-900 uppercase">
                {t.step} {step.number}
              </h3>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <a
          href="https://forms.gle/seu-formulario-aqui"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Bike className="w-6 h-6" />
          {t.donationButton}
        </a>
      </div>
    </section>
  );
}
