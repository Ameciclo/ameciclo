import { useState, useMemo, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, ArrowUpDown } from "lucide-react";

function orderHeaders(headers: string[]) {
  // Ordem específica para as colunas prioritárias
  const priorityOrder = [
    "cd_funcao", "cd_nm_funcao", "cd_nm_subfuncao",
    "cd_prog", "cd_nm_prog",
    "cd_acao", "cd_nm_acao",
    "cd_subacao", "cd_nm_subacao",
  ];

  const prioritized = [];
  // Adiciona na ordem específica
  for (const header of priorityOrder) {
    if (headers.includes(header)) {
      prioritized.push(header);
    }
  }

  const others = headers.filter(h => !priorityOrder.includes(h) && isNaN(Number(h)));
  const values = headers.filter(h => !priorityOrder.includes(h) && !isNaN(Number(h)));

  return [...prioritized, ...others, ...values];
}

const headerLabels: Record<string, string> = {
  "cd_nm_funcao": "Nome Função",
  "cd_nm_prog": "Nome Programa",
  "cd_nm_acao": "Nome Ação",
  "cd_nm_subacao": "Nome Subação",
  "cd_nm_subfuncao": "Nome Subfunção",
  "vlrdotatualizada": "Valor do Total Atualizado",
  "vlrtotalpago": "Valor do Total Pago",
  "vlrempenhado": "Valor Empenhado",
  "vlrliquidado": "Valor Liquidado",
};

function getHeaderLabel(header: string) {
  return headerLabels[header] || header;
}

export default function DataTable({
  data,
  search = "",
  page = 1,
  itemsPerPage = 50,
  filters = {},
}: {
  data: any[];
  search?: string;
  page?: number;
  itemsPerPage?: number;
  filters?: Record<string, { value: string; operator: string }>;
}) {
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(["cd_nm_prog", "cd_nm_subfuncao", "vlrdotatualizada"]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageInputValue, setPageInputValue] = useState(page.toString());
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);
  // Removido o estado de filtros ativos, substituído por valueFilters
  const [currentFilter, setCurrentFilter] = useState<{
    value: string;
    field: string;
  }>({
    value: "",
    field: "vlrempenhado"
  });
  
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({}); // Filtros memorizados

  const headers = data.length > 0 ? orderHeaders(Object.keys(data[0])) : [];

  const toggleColumn = (header: string) => {
    setHiddenColumns(prev =>
      prev.includes(header)
        ? prev.filter(h => h !== header)
        : [...prev, header]
    );
  };

  const visibleHeaders = ["#", ...headers.filter(h => !hiddenColumns.includes(h))];

  const highlightText = (text: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-200">{part}</mark>
        : part
    );
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Aplicar filtro atual
      if (currentFilter.value) {
        const cellValue = row[currentFilter.field]?.toString().toLowerCase() ?? "";
        if (!cellValue.includes(currentFilter.value.toLowerCase())) {
          return false;
        }
      }
      
      // Aplicar filtros memorizados
      return Object.entries(activeFilters).every(([field, filterValue]) => {
        const cellValue = row[field]?.toString().toLowerCase() ?? "";
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  }, [data, currentFilter, activeFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      const aStr = aVal?.toString() ?? "";
      const bStr = bVal?.toString() ?? "";
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / currentItemsPerPage);
  const startIdx = (currentPage - 1) * currentItemsPerPage;
  const pageData = sortedData.slice(startIdx, startIdx + currentItemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInputValue(newPage.toString());
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInputValue(newPage.toString());
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPageInputValue(inputValue);

    const value = parseInt(inputValue);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      setCurrentPage(value);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(page);
    setPageInputValue(page.toString());
  }, [page]);
  
  // Removido o efeito de sincronização com os filtros externos

  const handleSort = (header: string) => {
    if (header === "#") return;
    setSortConfig(prev => {
      if (prev?.key === header) {
        return {
          key: header,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: header, direction: "asc" };
    });
  };

  const handleFilterChange = (value: string) => {
    setCurrentFilter(prev => ({
      ...prev,
      value
    }));
  };
  
  const handleFieldChange = (field: string) => {
    setCurrentFilter(prev => ({
      ...prev,
      field
    }));
  };
  
  const addFilter = () => {
    if (currentFilter.value) {
      setActiveFilters(prev => ({
        ...prev,
        [currentFilter.field]: currentFilter.value
      }));
    }
  };

  return (
    <>
      <div className="overflow-x-auto h-[calc(100vh-300px)] flex flex-col">
        <label className="block mb-1 text-xs font-semibold flex items-center gap-1">
          <Eye size={14} />
          <span>Campos visíveis</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {headers.map(header => (
            <button
              key={header}
              onClick={() => toggleColumn(header)}
              className={`px-2 py-0.5 border rounded text-xs transition flex items-center gap-1 ${hiddenColumns.includes(header)
                ? "bg-gray-100 text-gray-400"
                : "bg-[#008080] text-white"
                }`}
            >
              {hiddenColumns.includes(header) ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{getHeaderLabel(header)}</span>
            </button>
          ))}
        </div>
        
        <table className="min-w-full border border-gray-300 flex-grow">
          <thead>
            <tr>
              {visibleHeaders.map(header => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className={`
                  border px-1 py-0 text-xs bg-gray-100
                  ${header !== "#" ? "cursor-pointer select-none" : ""}
                  ${header === "cd_nm_funcao" ? "w-64" : ""}
                `}
                >
                  <div className="flex items-center gap-1">
                    <span>{header === "#" ? "Índice" : getHeaderLabel(header)}</span>
                    {header !== "#" && (
                      sortConfig?.key === header ? 
                        sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} /> 
                        : <ArrowUpDown size={14} className="opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-1 py-0 text-xs text-center">
                  {startIdx + idx + 1}
                </td>
                {visibleHeaders.slice(1).map(header => (
                  <td
                    key={header}
                    className={`border px-1 py-0 text-xs ${header === "cd_nm_funcao" ? "w-64" : ""
                      }`}
                  >
                    {highlightText(row[header]?.toString() ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="flex justify-between items-center mt-2 h-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="border px-2 py-0.5 rounded disabled:opacity-50 flex items-center"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xs">Página</span>
              <input
                type="number"
                min={1}
                max={totalPages || 1}
                value={pageInputValue}
                onChange={handlePageChange}
                onKeyDown={(e) => {
                  // Impede a digitação de valores inválidos
                  const newValue = e.currentTarget.value + e.key;
                  if (!/^\d+$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                  } else if (/^\d+$/.test(e.key)) {
                    const numValue = parseInt(newValue);
                    if (numValue > totalPages) {
                      e.preventDefault();
                    }
                  }
                }}
                onBlur={() => {
                  const value = parseInt(pageInputValue);
                  if (isNaN(value) || value < 1 || value > totalPages) {
                    setPageInputValue(currentPage.toString());
                  }
                }}
                className="border w-12 px-1 py-0.5 text-center rounded"
                aria-label="Número da página"
              />
              <span className="text-xs">de {totalPages || 1}</span>
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="border px-2 py-0.5 rounded disabled:opacity-50 flex items-center"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="text-xs font-medium">
            {filteredData.length.toLocaleString('pt-BR')} resultados encontrados
          </div>
        </div>
      )}
    </>
  );
}
