import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import DataTable from "~/components/DadosAbertos/DataTable";

// Função para buscar dados da API CKAN
async function fetchCkanData() {
  const res = await fetch(
    "https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json"
  );

  if (!res.ok) {
    throw new Response("Erro ao buscar dados da API CKAN", { status: 500 });
  }

  const jsonData = await res.json();
  return jsonData.campos ?? [];
}

// Loader para carregar dados do Realtime Database
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // No servidor, carregamos apenas os dados da API CKAN
    const ckanData = await fetchCkanData();
    
    return json({ 
      ckanData,
      message: null
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({ 
      ckanData: [],
      message: "Erro ao carregar dados. Tente novamente mais tarde."
    });
  }
};

export default function DadosRealtime() {
  const { ckanData, message } = useLoaderData<typeof loader>();
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"realtime" | "ckan">("realtime");
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{success: boolean, message: string} | null>(null);
  
  // Carregar dados do Realtime Database no cliente
  useEffect(() => {
    async function loadRealtimeData() {
      try {
        setLoading(true);
        // Simulação de carregamento de dados
        // Quando o Firebase estiver configurado, substituir por chamada real
        setTimeout(() => {
          setRealtimeData([]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao carregar dados do Realtime Database:", error);
        setLoading(false);
      }
    }
    
    loadRealtimeData();
  }, []);
  
  // Atualizar dados exibidos quando a aba mudar
  useEffect(() => {
    setCurrentData(activeTab === "realtime" ? realtimeData : ckanData);
  }, [activeTab, realtimeData, ckanData]);
  
  // Função para salvar dados no Realtime Database
  async function saveToRealtime(data: any) {
    try {
      setSaveStatus(null);
      // Simulação de salvamento
      // Quando o Firebase estiver configurado, substituir por chamada real
      setTimeout(() => {
        setSaveStatus({ success: true, message: "Simulação: Dados salvos com sucesso!" });
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      setSaveStatus({ success: false, message: "Erro ao salvar dados. Tente novamente." });
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dados Realtime Database - LOA</h1>
      
      {(message || saveStatus?.message) && (
        <div className={`p-4 rounded ${saveStatus?.success ? "bg-green-100" : "bg-red-100"}`}>
          {message || saveStatus?.message}
        </div>
      )}
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("realtime")}
          className={`px-4 py-2 rounded ${
            activeTab === "realtime" 
              ? "bg-[#008080] text-white" 
              : "bg-gray-200"
          }`}
        >
          Dados Realtime {loading ? "(Carregando...)" : `(${realtimeData.length})`}
        </button>
        <button
          onClick={() => setActiveTab("ckan")}
          className={`px-4 py-2 rounded ${
            activeTab === "ckan" 
              ? "bg-[#008080] text-white" 
              : "bg-gray-200"
          }`}
        >
          Dados CKAN ({ckanData.length})
        </button>
      </div>
      
      {activeTab === "ckan" && ckanData.length > 0 && (
        <div className="mb-4">
          <p className="text-sm mb-2">
            Selecione um registro para salvar no Realtime Database:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ckanData.slice(0, 6).map((item: any, index: number) => (
              <div key={index} className="border p-3 rounded">
                <div className="text-sm mb-2">
                  <strong>Função:</strong> {item.cd_nm_funcao || "N/A"}
                </div>
                <div className="text-sm mb-2">
                  <strong>Programa:</strong> {item.cd_nm_prog || "N/A"}
                </div>
                <div className="text-sm mb-2">
                  <strong>Valor:</strong> {item.vlrempenhado || "N/A"}
                </div>
                
                <button 
                  onClick={() => saveToRealtime(item)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Salvar no Realtime DB
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading && activeTab === "realtime" ? (
        <div className="text-center p-8 bg-gray-100 rounded">
          Carregando dados do Realtime Database...
        </div>
      ) : currentData.length > 0 ? (
        <DataTable
          data={currentData}
          page={1}
          itemsPerPage={10}
        />
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded">
          {activeTab === "realtime" 
            ? "Nenhum dado encontrado no Realtime Database. Salve dados da API CKAN para visualizá-los aqui."
            : "Carregando dados da API CKAN..."}
        </div>
      )}
    </div>
  );
}