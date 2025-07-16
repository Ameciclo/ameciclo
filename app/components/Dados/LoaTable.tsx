import React, { useState, useMemo } from 'react';

interface Action {
  cd_nm_funcao: string;
  cd_nm_prog: string;
  vlrdotatualizada: number;
  vlrtotalpago: number;
  cd_nm_acao: string;
  cd_nm_subacao: string;
  vlrempenhado: number;
  vlrliquidado: number;
  cd_nm_subfuncao: string;
}

interface LoaTableProps {
  actions: Action[];
}

type SortableKeys = keyof Action;

const LoaTable: React.FC<LoaTableProps> = ({ actions }) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const filteredActions = useMemo(() => {
    return actions.filter(action =>
      Object.values(action).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [actions, searchTerm]);

  const sortedActions = useMemo(() => {
    let sortableItems = [...filteredActions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredActions, sortConfig]);

  const paginatedActions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedActions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedActions, currentPage]);

  const totalPages = Math.ceil(sortedActions.length / itemsPerPage);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const getSortIndicator = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleRowClick = (index: number) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    setExpandedRow(expandedRow === actualIndex ? null : actualIndex);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ações e Programas da LOA</h2>
      <p className="text-gray-600 mb-4">
        Explore, filtre e ordene os dados da Lei Orçamentária Anual. Clique nos cabeçalhos para ordenar ou use a busca para encontrar informações específicas.
      </p>
      <div className="relative mt-8 mb-6 pt-2">
        <label htmlFor="table-search" className="absolute -top-2 left-2 inline-block bg-white px-1 text-sm font-medium text-gray-900">
          Buscar Ações
        </label>
        <input
          id="table-search"
          type="text"
          placeholder="Digite aqui para filtrar..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-blue-500 tracking-wider cursor-pointer" onClick={() => requestSort('cd_nm_funcao')}>
                Função{getSortIndicator('cd_nm_funcao')}
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-blue-500 tracking-wider cursor-pointer" onClick={() => requestSort('cd_nm_prog')}>
                Programa{getSortIndicator('cd_nm_prog')}
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-blue-500 tracking-wider cursor-pointer" onClick={() => requestSort('cd_nm_acao')}>
                Ação{getSortIndicator('cd_nm_acao')}
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-blue-500 tracking-wider cursor-pointer" onClick={() => requestSort('vlrdotatualizada')}>
                Dotação Atualizada{getSortIndicator('vlrdotatualizada')}
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-blue-500 tracking-wider cursor-pointer" onClick={() => requestSort('vlrtotalpago')}>
                Total Pago{getSortIndicator('vlrtotalpago')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedActions.map((action, index) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + index;
              return (
                <React.Fragment key={actualIndex}>
                  <tr className="cursor-pointer md:cursor-default hover:bg-gray-100" onClick={() => handleRowClick(index)}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{getHighlightedText(action.cd_nm_funcao, searchTerm)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{getHighlightedText(action.cd_nm_prog, searchTerm)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{getHighlightedText(action.cd_nm_acao, searchTerm)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{getHighlightedText(formatCurrency(action.vlrdotatualizada), searchTerm)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{getHighlightedText(formatCurrency(action.vlrtotalpago), searchTerm)}</td>
                  </tr>
                  {expandedRow === actualIndex && (
                    <tr className="md:hidden">
                      <td colSpan={5} className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="space-y-2">
                          <p><strong>Sub-ação:</strong> {getHighlightedText(action.cd_nm_subacao, searchTerm)}</p>
                          <p><strong>Valor Empenhado:</strong> {getHighlightedText(formatCurrency(action.vlrempenhado), searchTerm)}</p>
                          <p><strong>Valor Liquidado:</strong> {getHighlightedText(formatCurrency(action.vlrliquidado), searchTerm)}</p>
                          <p><strong>Sub-função:</strong> {getHighlightedText(action.cd_nm_subfuncao, searchTerm)}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
};

export default LoaTable;