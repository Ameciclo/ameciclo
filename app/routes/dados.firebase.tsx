import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useState, useEffect } from "react";
import DataTable from "~/components/DadosAbertos/DataTable";

// Interface para os dados da LOA
export interface LoaData {
  cd_nm_funcao?: string;
  cd_nm_prog?: string;
  cd_nm_acao?: string;
  cd_nm_subacao?: string;
  cd_nm_subfuncao?: string;
  vlrdotatualizada?: number;
  vlrtotalpago?: number;
  vlrempenhado?: number;
  vlrliquidado?: number;
  timestamp?: number;
}

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

// Loader para carregar dados
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Por enquanto, apenas carregamos dados da API CKAN
    const ckanData = await fetchCkanData();
    
    return json({ 
      firebaseData: [], // Inicialmente vazio
      ckanData,
      message: null
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({ 
      firebaseData: [], 
      ckanData: [],
      message: "Erro ao carregar dados. Tente novamente mais tarde."
    });
  }
};

// Action para processar formulários
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    
    if (action === "saveToFirebase") {
      // Simulação de salvamento (será implementado quando o Firebase estiver configurado)
      return json({ success: true, message: "Simulação: Dados salvos com sucesso!" });
    }
    
    return json({ success: false, message: "Dados inválidos." });
  } catch (error) {
    console.error("Erro ao processar ação:", error);
    return json({ success: false, message: "Erro ao processar ação. Tente novamente." });
  }
};

export default function DadosFirebase() {
  const { firebaseData, ckanData, message } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  const [activeTab, setActiveTab] = useState<"firebase" | "ckan">("firebase");
  const [currentData, setCurrentData] = useState<any[]>(firebaseData);
  
  useEffect(() => {
    setCurrentData(activeTab === "firebase" ? firebaseData : ckanData);
  }, [activeTab, firebaseData, ckanData]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dados Firebase - LOA</h1>
      
      {(message || actionData?.message) && (
        <div className={`p-4 rounded ${actionData?.success ? "bg-green-100" : "bg-red-100"}`}>
          {message || actionData?.message}
        </div>
      )}
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("firebase")}
          className={`px-4 py-2 rounded ${
            activeTab === "firebase" 
              ? "bg-[#008080] text-white" 
              : "bg-gray-200"
          }`}
        >
          Dados Firebase ({firebaseData.length})
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
            Selecione um registro para salvar no Firebase:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ckanData.slice(0, 6).map((item: any, index: number) => (
              <Form method="post" key={index} className="border p-3 rounded">
                <input type="hidden" name="action" value="saveToFirebase" />
                <input type="hidden" name="index" value={index} />
                <input type="hidden" name="jsonData" value={JSON.stringify(item)} />
                
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
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Salvar no Firebase
                </button>
              </Form>
            ))}
          </div>
        </div>
      )}
      
      {currentData.length > 0 ? (
        <DataTable
          data={currentData}
          page={1}
          itemsPerPage={10}
        />
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded">
          {activeTab === "firebase" 
            ? "Nenhum dado encontrado no Firebase. Salve dados da API CKAN para visualizá-los aqui."
            : "Carregando dados da API CKAN..."}
        </div>
      )}
    </div>
  );
}