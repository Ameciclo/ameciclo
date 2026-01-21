import {
  BuildingIcon,
  ChatIcon,
  BikeIcon,
  ToolIcon,
  ShopIcon,
  BookIcon,
  CoffeeIcon,
  FormIcon
} from "~/components/Commom/Icones/ParticipeIcons";

interface HeadquartersSectionProps {
  darkMode: boolean;
  fontSize: number;
}

export function HeadquartersSection({ darkMode, fontSize }: HeadquartersSectionProps) {
  return (
    <div className={`border-2 rounded-xl shadow-lg p-8 ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600" : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"}`}>
      <div className="flex items-center justify-center gap-4 mb-8">
        <BuildingIcon className="w-8 h-8 text-gray-800" />
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-600"}`}>
          Nossa Sede
        </h2>
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
            <li style={{ fontSize: `${fontSize}px` }}>• Conheça nosso funcionamento</li>
            <li style={{ fontSize: `${fontSize}px` }}>• Troca de ideias sobre mobilidade</li>
            <li style={{ fontSize: `${fontSize}px` }}>• Registro de ocorrências via Bicibot</li>
            <li style={{ fontSize: `${fontSize}px` }}>• Networking cicloativista</li>
          </ul>
        </div>

        <div className="bg-white/80 backdrop-blur p-6 rounded-lg border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <BikeIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-blue-600">Doação de Bicicletas</h3>
          </div>
          <p className="text-gray-700 mb-3">
            Doe bicicletas ou peças! Usamos as doações na oficina mecânica e no projeto Bota pra Rodar.
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
            Ferramentas disponíveis para uso gratuito no local! Temos mecânico para ajudar ou fazer serviços remunerados quando necessário.
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
          <FormIcon className="w-4 h-4 mr-2" />
          Acessar Formulário
        </a>
      </div>
    </div>
  );
}
