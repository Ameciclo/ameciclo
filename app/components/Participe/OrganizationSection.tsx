import { TelegramIcon, CalendarIcon } from "~/components/Commom/Icones/ParticipeIcons";

export function OrganizationSection() {
  return (
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
            <li>
              • <strong><a href="https://t.me/ameciclobot" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">@ameciclobot</a></strong> - Nosso bot oficial
            </li>
            <li>
              • <strong><a href="https://t.me/ameciclo" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">t.me/ameciclo</a></strong> - Canal de notícias
            </li>
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
            <li>
              • Consulte <strong><a href="https://docs.google.com/spreadsheets/d/15LGWKkfLicuKiJC_aX0pjXOGuwnp0gSkJijwH6moJaI/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">pautas.ameciclo.org</a></strong>
            </li>
            <li>
              • Veja o <strong><a href="https://docs.google.com/document/d/1QgQZW7rT16jBBbJOskzayezMKm7ux-SdtmsTAHk9yAA/edit?tab=t.0#heading=h.gjdgxs" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">estatuto.ameciclo.org</a></strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
