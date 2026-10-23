import { FileText, Download } from "lucide-react";

export default function ReportsSection() {
  return (
      <section className="container mx-auto px-4 my-16">
        <div className="bg-linear-to-br from-ameciclo/5 to-ameciclo/10 rounded-xl p-8 border border-ameciclo/20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-ameciclo" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Estudos e Análises Completas</h2>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                Acesse relatórios técnicos, pesquisas históricas e análises detalhadas sobre mobilidade por bicicleta<br />
                no Recife produzidos pela Ameciclo ao longo dos anos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://drive.google.com/uc?export=download&id=1Ww5YKKtK7loXFg8ELxgm7kkalkI3A0rk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Evolução de Perfil Ciclista Recife - PE</h3>
                  <p className="text-sm text-gray-500 mt-1">2025</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a
              href="https://drive.google.com/uc?export=download&id=1yW7sEU-y4BpIdZZeg1LpU0J2buaAuBWB"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Pesquisa Perfil do Ciclista</h3>
                  <p className="text-sm text-gray-500 mt-1">2018</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a
              href="https://drive.google.com/uc?export=download&id=0BzQ5vNvMmIF4YmRVRnFWd1BTNG8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Pesquisa Perfil do Ciclista</h3>
                  <p className="text-sm text-gray-500 mt-1">2015</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a
              href="https://drive.google.com/uc?export=download&id=0BxR5Ri6g5X_ZN0ZaVzdXYTdQSUk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Mobilidade por Bicicleta no Recife</h3>
                  <p className="text-sm text-gray-500 mt-1">Diagnóstico e ações estratégicas (2013)</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>
          </div>
        </div>
      </section>
  );
}
