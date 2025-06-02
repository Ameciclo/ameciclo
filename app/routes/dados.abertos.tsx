import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import DataTable from "~/components/DadosAbertos/DataTable";
import { saveToRealtimeDatabase } from "~/services/firebaseRealtimeAdmin.server";

// Map de labels para filtros
const headerLabels: Record<string, string> = {
  cd_nm_funcao:  "Nome Função",
  cd_nm_prog:    "Nome Programa",
  cd_nm_acao:    "Nome Ação",
  cd_nm_subacao: "Nome Subação",
  cd_nm_subfuncao: "Nome Subfunção",
  vlrdotatualizada: "Valor do Total Atualizado",
  vlrtotalpago:  "Valor do Total Pago",
  vlrempenhado:  "Valor Empenhado",
  vlrliquidado:  "Valor Liquidado",
};

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-\u036f]/g, "")
    .toLowerCase();
}

function searchByTerms(item: any, terms: string): boolean {
  const keys = [
    "cd_nm_funcao",
    "cd_nm_prog",
    "cd_nm_acao",
    "cd_nm_subacao",
    "cd_nm_subfuncao",
  ];

  const normalizedTerms = normalizeString(terms);
  return keys.some((key) =>
    normalizeString(item[key] ?? "").includes(normalizedTerms)
  );
}

function compareFilter(
  item: any,
  field: string,
  value: string,
  operator: string
): boolean {
  const itemValue = Number(item[field]);
  const filterValue = Number(value);
  if (isNaN(itemValue) || isNaN(filterValue)) return false;

  if (operator === "equal") return itemValue === filterValue;
  if (operator === "greater") return itemValue > filterValue;
  if (operator === "less") return itemValue < filterValue;

  return false;
}

let cache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const now = Date.now();
  let data: any[] = [];

  if (cache && now - cache.timestamp < CACHE_DURATION) {
    data = cache.data;
  } else {
    const res = await fetch(
      "https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json"
    );

    if (!res.ok) {
      throw new Response("Erro ao buscar dados da API CKAN", { status: 500 });
    }

    const jsonData = await res.json();
    data = jsonData.campos ?? [];
    cache = { data, timestamp: now };
    
    // Salvar os dados no Firebase Realtime Database
    try {
      await saveToRealtimeDatabase('dadosLOA', {
        dados: data,
        ultimaAtualizacao: now
      });
      console.log('Dados salvos no Firebase Realtime Database com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados no Firebase:', error);
      // Não interrompe o fluxo se houver erro ao salvar no Firebase
    }
  }

  return json({ data });
};

export default function DadosAbertos() {
  const { data: serverData } = useLoaderData<typeof loader>();
  const [data, setData] = useState<any[]>(serverData);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Array<{field: string; operator: string; value: string}>>([]);
  const [currentField, setCurrentField] = useState("vlrempenhado");
  const [currentOperator, setCurrentOperator] = useState("equal");
  const [currentFilterValue, setCurrentFilterValue] = useState("");
  const [showFieldFilter, setShowFieldFilter] = useState(false);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let filtered = [...serverData];

    if (searchTerm) {
      filtered = filtered.filter((item) => searchByTerms(item, searchTerm));
    }

    // Aplicar todos os filtros memorizados
    if (filters.length > 0) {
      filtered = filtered.filter((item) => 
        filters.every(filter => 
          compareFilter(item, filter.field, filter.value, filter.operator)
        )
      );
    }

    // Aplicar filtro temporário (reativo)
    if (currentField && currentFilterValue) {
      filtered = filtered.filter((item) => 
        compareFilter(item, currentField, currentFilterValue, currentOperator)
      );
    }

    setData(filtered);
    setCurrentPage(1); // Reset para a primeira página quando os filtros mudam
  }, [searchTerm, filters, serverData, currentField, currentFilterValue, currentOperator]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Ações e Programas – Dados Abertos PE</h1>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="BUSCAR TERMO"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
        <button
          onClick={() => setShowFieldFilter((show) => !show)}
          className="flex items-center w-full text-sm font-semibold text-gray-700"
        >
          <span>Filtro por Campo de Valores</span>
          <span className="pl-4">{showFieldFilter ? "▲" : "▼"}</span>
        </button>

        {showFieldFilter && (
          <div className="space-y-4">
            {/* Adicionar novo filtro */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 text-sm">
                <select
                  value={currentField}
                  onChange={(e) => setCurrentField(e.target.value)}
                  className="border px-2 py-0.5 rounded text-xs"
                >
                  <option value="vlrempenhado">Valor Empenhado</option>
                  <option value="vlrliquidado">Valor Liquidado</option>
                  <option value="vlrtotalpago">Valor do Total Pago</option>
                  <option value="vlrdotatualizada">Valor do Total Atualizado</option>
                </select>

                <select
                  value={currentOperator}
                  onChange={(e) => setCurrentOperator(e.target.value)}
                  className="border px-2 py-0.5 rounded text-xs"
                >
                  <option value="equal">IGUAL</option>
                  <option value="greater">MAIOR QUE</option>
                  <option value="less">MENOR QUE</option>
                </select>

                <input
                  type="text"
                  placeholder="Valor"
                  value={currentFilterValue}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setCurrentFilterValue(value);
                    }
                  }}
                  className="border px-2 py-0.5 rounded text-xs w-32"
                />
              </div>
              
              <button
                onClick={() => {
                  if (currentField && currentFilterValue) {
                    setFilters([...filters, {
                      field: currentField,
                      operator: currentOperator,
                      value: currentFilterValue
                    }]);
                    // Não resetar o campo e operador, apenas o valor
                    setCurrentFilterValue("");
                  }
                }}
                disabled={!currentFilterValue}
                className="self-start px-2 py-0.5 bg-[#008080] text-white text-xs rounded flex items-center gap-1"
              >
                <PlusCircle size={12} />
                <span>Adicionar filtro</span>
              </button>
              
              {/* Filtros existentes */}
              {filters.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center bg-blue-100 px-1 py-0.5 rounded text-xs">
                      <span>
                        {headerLabels[filter.field] || filter.field} 
                        {filter.operator === "equal" ? " = " : filter.operator === "greater" ? " > " : " < "}
                        {filter.value}
                      </span>
                      <button 
                        onClick={() => setFilters(filters.filter((_, i) => i !== index))}
                        className="ml-1 text-gray-600 hover:text-red-600"
                        title="Remover filtro"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DataTable
        data={data}
        search={searchTerm}
        page={currentPage}
        itemsPerPage={itemsPerPage}
        filters={filters.reduce((acc, filter) => {
          acc[filter.field] = { value: filter.value, operator: filter.operator };
          return acc;
        }, {} as Record<string, { value: string; operator: string }>)}
      />
    </div>
  );
}