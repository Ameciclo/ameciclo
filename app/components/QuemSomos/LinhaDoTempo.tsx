import { motion } from "framer-motion";
import { Calendar, Users, Award, MapPin, BookOpen, Bike } from "lucide-react";

interface TimelineEvent {
  year: string;
  title: string;
  description?: string;
  category: "pre" | "ameciclo" | "forum" | "parceria" | "rede" | "gestao";
  icon?: "calendar" | "users" | "award" | "map" | "book" | "bike";
}

const events: TimelineEvent[] = [
  // PRÉ-AMECICLO
  { year: "2008", title: "Bicicletada | Massa Crítica Recife", category: "pre", icon: "bike" },
  { year: "2011", title: "Bike Anjo", category: "pre", icon: "users" },
  { year: "2012", title: "Cicloação", category: "pre", icon: "bike" },
  { year: "2012", title: "Reuniões estatutárias de formação da Ameciclo", category: "pre", icon: "users" },
  { year: "2012", title: "Massa Crítica (100 a 200 participantes)", category: "pre", icon: "users" },
  
  // AMECICLO
  { year: "2013", title: "Fundação da Ameciclo", description: "1 de abril de 2013 - 72 pessoas na praça do Derby sob o nome de Associação Metropolitana de Ciclistas do Grande Recife", category: "ameciclo", icon: "award" },
  { year: "2013", title: "1ª Sede (Plexos Coworking)", category: "ameciclo", icon: "map" },
  { year: "2013", title: "1° mudança Estatuto", category: "ameciclo", icon: "book" },
  { year: "2013", title: "Participação da Construção do PDC-RMR", category: "ameciclo", icon: "book" },
  { year: "2013", title: "Pesquisa Qualitativa Sistêmica na Ciclofaixas de Lazer", category: "ameciclo", icon: "book" },
  { year: "2013", title: "Primeiras contagens de ciclistas", category: "ameciclo", icon: "users" },
  { year: "2013", title: "Projeto Amigo Motô", category: "ameciclo", icon: "bike" },
  { year: "2013", title: "Ameciclo nas Escolas", category: "ameciclo", icon: "book" },
  { year: "2013", title: "Ameciclo Debates", category: "ameciclo", icon: "users" },
  { year: "2013", title: "Amecine", category: "ameciclo", icon: "calendar" },
  
  { year: "2014", title: "Primeira Avaliação Institucional", category: "ameciclo", icon: "book" },
  { year: "2014", title: "Bicicletários no Carnaval", category: "ameciclo", icon: "bike" },
  { year: "2014", title: "Concurso da Marca", category: "ameciclo", icon: "award" },
  { year: "2014", title: "Duas Menções Honrosas no Prêmio Promoção da Bicicleta no Brasil", description: "Projeto Amigo Motô e Pesquisa Qualitativa Sistêmica", category: "ameciclo", icon: "award" },
  { year: "2014", title: "Projeto Ciclo - Primeiro projeto financiado", description: "Apoio Itaú", category: "ameciclo", icon: "award" },
  { year: "2014", title: "Vistorias de Bicicletas Compartilhadas", category: "ameciclo", icon: "bike" },
  
  { year: "2015", title: "1ª Pesquisa Perfil do Ciclista", category: "ameciclo", icon: "book" },
  { year: "2015", title: "Meu Chinelo Não É Freio", category: "ameciclo", icon: "bike" },
  { year: "2015", title: "Bota Pra Rodar", description: "Edital do Fundo Socioambiental CASA", category: "ameciclo", icon: "award" },
  { year: "2015", title: "Livro A Bicicleta no Brasil", category: "ameciclo", icon: "book" },
  { year: "2015", title: "FNEBICI", category: "ameciclo", icon: "users" },
  { year: "2015", title: "Livro Bicicleta Amarela", category: "ameciclo", icon: "book" },
  
  { year: "2016", title: "Desenvolvimento e aplicação do Ideciclo", category: "ameciclo", icon: "award" },
  { year: "2016", title: "Candidatura ao Fórum Mundial da Bicicleta", description: "Duas vezes segundo lugar (2017 e 2018)", category: "ameciclo", icon: "award" },
  { year: "2016", title: "Eleitas delegada no Conselho das Cidades", category: "ameciclo", icon: "users" },
  { year: "2016", title: "Parceria com o Bike Noronha", category: "ameciclo", icon: "bike" },
  { year: "2016", title: "Relatório da Mobilidade por Bicicleta", category: "ameciclo", icon: "book" },
  { year: "2016", title: "Campanha Basta de Mortes no Trânsito", description: "Ação na Conde da Boa Vista", category: "ameciclo", icon: "users" },
  
  { year: "2017", title: "2ª Sede (IAB-PE)", category: "ameciclo", icon: "map" },
  { year: "2017", title: "2° mudança Estatuto", description: "Mudança no nome, horizontalidade e gênero neutro", category: "ameciclo", icon: "book" },
  { year: "2017", title: "Brasil que pedala: Tamandaré", category: "ameciclo", icon: "bike" },
  { year: "2017", title: "Prêmio Promoção da Bicicleta no Brasil", description: "Bota pra Rodar", category: "ameciclo", icon: "award" },
  { year: "2017", title: "Menção de reconhecimento da Folkersma", description: "Bota pra Rodar", category: "ameciclo", icon: "award" },
  { year: "2017", title: "Bicicultura Recife: A Revolução das Bicicletas", category: "ameciclo", icon: "bike" },
  
  { year: "2018", title: "Donde vem, pronde vão?", category: "ameciclo", icon: "book" },
  { year: "2018", title: "Apoio institucional para Cicloação e Biciflow", category: "ameciclo", icon: "users" },
  { year: "2018", title: "Apoio para diversos projetos com o Greenpeace", category: "ameciclo", icon: "users" },
  { year: "2018", title: "Bicicleta Verde e Branca", category: "ameciclo", icon: "bike" },
  { year: "2018", title: "IDECICLO 2018", description: "Segunda realização e Menção Honrosa", category: "ameciclo", icon: "award" },
  { year: "2018", title: "Campanha #DesligamentoNão", category: "ameciclo", icon: "users" },
  { year: "2018", title: "Renovação do Bota pra Rodar Caranguejo Tabaiares", category: "ameciclo", icon: "bike" },
  { year: "2018", title: "Escola da Bicicleta", category: "ameciclo", icon: "book" },
  
  { year: "2019", title: "Cargueira - Fortalecimento Institucional", description: "Apoio da OAK", category: "ameciclo", icon: "award" },
  { year: "2019", title: "3° mudança Estatuto", category: "ameciclo", icon: "book" },
  { year: "2019", title: "Inauguração de sede própria (3ª Sede - Aurora)", category: "ameciclo", icon: "map" },
  { year: "2019", title: "Bota pra Rodar Santa Luzia", category: "ameciclo", icon: "bike" },
  { year: "2019", title: "Foca na Leitura", category: "ameciclo", icon: "book" },
  { year: "2019", title: "Ki-karro-o-kê?", category: "ameciclo", icon: "users" },
  { year: "2019", title: "Grupo de Trabalho de Mulheres", category: "ameciclo", icon: "users" },
  { year: "2019", title: "Bicibot", category: "ameciclo", icon: "bike" },
  { year: "2019", title: "Escola Bike Polo", category: "ameciclo", icon: "bike" },
  { year: "2019", title: "Fundo de Ações Livres", category: "ameciclo", icon: "award" },
  { year: "2019", title: "Desafio Intermodal", category: "ameciclo", icon: "bike" },
  
  { year: "2020", title: "Grupo de Trabalho Ciclopreto", category: "ameciclo", icon: "users" },
  { year: "2020", title: "Solta o Frei", category: "ameciclo", icon: "bike" },
  { year: "2020", title: "Relatório da Mobilidade Ativa", category: "ameciclo", icon: "book" },
  { year: "2020", title: "Pesquisa da História da Ameciclo", category: "ameciclo", icon: "book" },
  { year: "2020", title: "Campanha #100km100defeitos", category: "ameciclo", icon: "users" },
  { year: "2020", title: "#100Gurias100Medo", category: "ameciclo", icon: "users" },
];

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "calendar": return Calendar;
    case "users": return Users;
    case "award": return Award;
    case "map": return MapPin;
    case "book": return BookOpen;
    case "bike": return Bike;
    default: return Bike;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "pre": return "bg-gray-500";
    case "ameciclo": return "bg-green-500";
    case "forum": return "bg-blue-500";
    case "parceria": return "bg-purple-500";
    case "rede": return "bg-yellow-500";
    case "gestao": return "bg-red-500";
    default: return "bg-green-500";
  }
};

export default function LinhaDoTempo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Linha do Tempo
          </h1>
          <p className="text-xl text-gray-600">
            A história da Ameciclo desde 2008
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Linha vertical central */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gray-300 via-green-500 to-green-700" />

          {/* Seção Pré-Ameciclo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12 text-center"
          >
            <div className="inline-block bg-gray-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg relative z-10">
              PRÉ-AMECICLO
            </div>
          </motion.div>

          {events.filter(e => e.category === "pre").map((event, index) => {
            const Icon = getIcon(event.icon);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={`pre-${index}`}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center mb-8 ${isLeft ? "justify-start" : "justify-end"}`}
              >
                <div className={`w-5/12 ${isLeft ? "pr-8 text-right" : "pl-8 text-left"}`}>
                  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? "justify-end" : "justify-start"}`}>
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-bold text-gray-500">{event.year}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Ponto na linha */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-500 rounded-full border-4 border-white shadow-lg z-10" />
              </motion.div>
            );
          })}

          {/* Seção Ameciclo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="my-16 text-center"
          >
            <div className="inline-block bg-green-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl relative z-10">
              AMECICLO
            </div>
          </motion.div>

          {events.filter(e => e.category === "ameciclo").map((event, index) => {
            const Icon = getIcon(event.icon);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={`ameciclo-${index}`}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`relative flex items-center mb-8 ${isLeft ? "justify-start" : "justify-end"}`}
              >
                <div className={`w-5/12 ${isLeft ? "pr-8 text-right" : "pl-8 text-left"}`}>
                  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? "justify-end" : "justify-start"}`}>
                      <Icon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-bold text-green-600">{event.year}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Ponto na linha */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg z-10 hover:scale-125 transition-transform" />
              </motion.div>
            );
          })}

          {/* Final da linha */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center mt-12"
          >
            <div className="w-8 h-8 bg-green-700 rounded-full border-4 border-white shadow-xl z-10" />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16 text-gray-600"
        >
          <p className="text-lg">
            A história continua... 🚴
          </p>
        </motion.div>
      </div>
    </div>
  );
}
