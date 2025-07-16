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
  type?: 'good' | 'bad'; // Reintroduzindo a propriedade type
}

interface LoaTableProps {
  actions: Action[];
}

type SortableKeys = keyof Action;

const goodActionsTags = ["0398", "3308", "3378", "3382", "3389", "3786", "3891", "3906", "4122", "4123", "4165", "4167", "4185", "4294", "4313", "4482", "4648", "3198", "3340", "4202", "4642", "4646", "4176", "4483", "4166", "4074", "4055", "3721", "3725", "2755", "2796", "2286", "0569", "3877", "4131", "4235", "4679", "4682", "1313", "2967", "2730", "2733", "4650", "4669", "1537", "3178", "3187", "4116", "4440", "1896"];

const badActionsTags = [
  "4067", "4218", "1045", "3882", "4096", "4134", "4186", "4227"
];

const columnExplanations: Record<string, string> = {
  cd_nm_funcao: "Código e nome da função orçamentária, que agrupa as despesas por área de atuação do governo.",
  cd_nm_prog: "Código e nome do programa orçamentário, que organiza as ações de governo em torno de objetivos comuns.",
  cd_nm_acao: "Código e nome da ação orçamentária, que representa o detalhamento da despesa para alcançar os objetivos do programa.",
  cd_nm_subacao: "Código e nome da sub-ação, um detalhamento adicional da ação orçamentária.",
  cd_nm_subfuncao: "Código e nome da subfunção, que detalha ainda mais a função orçamentária.",
  vlrdotatualizada: "Valor da dotação orçamentária atualizada, ou seja, o montante total autorizado para a despesa após eventuais suplementações ou reduções.",
  vlrempenhado: "Valor empenhado, que é o montante da despesa que foi reservado no orçamento para um fim específico.",
  vlrliquidado: "Valor liquidado, que é o montante da despesa que foi verificada e comprovada, tornando-a apta para pagamento.",
  vlrtotalpago: "Valor total pago, que é o montante da despesa que foi efetivamente quitada.",
};

const LoaTable: React.FC<LoaTableProps> = ({ actions }) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'good' | 'bad'>('all');
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const itemsPerPage = 10;

  const getActionCode = (action: Action) => {
    const match = action.cd_nm_acao.match(/^(\d+)/);
    return match ? match[1] : '';
  };

  const isGoodAction = (action: Action) => {
    const actionCode = getActionCode(action);
    return goodActionsTags.includes(actionCode);
  };

  const isBadAction = (action: Action) => {
    const actionCode = getActionCode(action);
    return badActionsTags.includes(actionCode);
  };

  const classifiedActions = useMemo(() => {
    return actions.map(action => {
      if (isGoodAction(action)) {
        return { ...action, type: 'good' };
      } else if (isBadAction(action)) {
        return { ...action, type: 'bad' };
      }
      return action;
    });
  }, [actions]);

  const filteredActions = useMemo(() => {
    let tempActions = classifiedActions.filter(action =>
      Object.values(action).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (filterType === 'good') {
      tempActions = tempActions.filter(action => action.type === 'good');
    } else if (filterType === 'bad') {
      tempActions = tempActions.filter(action => action.type === 'bad');
    }

    return tempActions;
  }, [classifiedActions, searchTerm, filterType]);

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

  const renderColumnHeader = (key: SortableKeys, title: string) => (
    <th
      className="hidden md:table-cell px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-blue-500 tracking-wider cursor-pointer relative group"
      onClick={() => requestSort(key)}
      onMouseEnter={() => setHoveredColumn(key)}
      onMouseLeave={() => setHoveredColumn(null)}
    >
      {title}{getSortIndicator(key)}
      {hoveredColumn === key && columnExplanations[key] && (
        <div className="absolute z-10 bg-[rgba(0,128,128,0.1)] text-gray-800 text-xs p-3 rounded-lg bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-normal w-56 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {columnExplanations[key]}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[rgba(0,128,128,0.1)]"></div>
        </div>
      )}
    </th>
  );

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
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todas as Ações
        </button>
        <button
          onClick={() => setFilterType('good')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${filterType === 'good' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Boas Ações
        </button>
        <button
          onClick={() => setFilterType('bad')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${filterType === 'bad' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Má Ações
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {renderColumnHeader('cd_nm_funcao', 'Função')}
              {renderColumnHeader('cd_nm_prog', 'Programa')}
              {renderColumnHeader('cd_nm_acao', 'Ação')}
              {renderColumnHeader('cd_nm_subacao', 'Sub-ação')}
              {renderColumnHeader('cd_nm_subfuncao', 'Sub-função')}
              {renderColumnHeader('vlrdotatualizada', 'Dotação Atualizada')}
              {renderColumnHeader('vlrempenhado', 'Valor Empenhado')}
              {renderColumnHeader('vlrliquidado', 'Valor Liquidado')}
              {renderColumnHeader('vlrtotalpago', 'Total Pago')}
            </tr>
          </thead>
          <tbody>
            {paginatedActions.map((action, index) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + index;
              const rowClassName = `cursor-pointer md:cursor-default hover:bg-gray-100 ${action.type === 'good' ? 'bg-green-50' : action.type === 'bad' ? 'bg-red-50' : ''}`;
              return (
                <React.Fragment key={actualIndex}>
                  <tr className={rowClassName} onClick={() => handleRowClick(index)}>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(action.cd_nm_funcao, searchTerm)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(action.cd_nm_prog, searchTerm)}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(action.cd_nm_acao, searchTerm)}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(action.cd_nm_subacao, searchTerm)}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(action.cd_nm_subfuncao, searchTerm)}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(formatCurrency(action.vlrdotatualizada), searchTerm)}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(formatCurrency(action.vlrempenhado), searchTerm)}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(formatCurrency(action.vlrliquidado), searchTerm)}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-no-wrap border-b border-gray-500 text-xs md:text-sm">{getHighlightedText(formatCurrency(action.vlrtotalpago), searchTerm)}</td>
                  </tr>
                  {expandedRow === actualIndex && (
                    <tr className="md:hidden">
                      <td colSpan={2} className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="space-y-2 text-xs">
                          <p><strong>Função:</strong> {getHighlightedText(action.cd_nm_funcao, searchTerm)}</p>
                          <p><strong>Programa:</strong> {getHighlightedText(action.cd_nm_prog, searchTerm)}</p>
                          <p><strong>Ação:</strong> {getHighlightedText(action.cd_nm_acao, searchTerm)}</p>
                          <p><strong>Sub-ação:</strong> {getHighlightedText(action.cd_nm_subacao, searchTerm)}</p>
                          <p><strong>Sub-função:</strong> {getHighlightedText(action.cd_nm_subfuncao, searchTerm)}</p>
                          <p><strong>Dotação Atualizada:</strong> {getHighlightedText(formatCurrency(action.vlrdotatualizada), searchTerm)}</p>
                          <p><strong>Valor Empenhado:</strong> {getHighlightedText(formatCurrency(action.vlrempenhado), searchTerm)}</p>
                          <p><strong>Valor Liquidado:</strong> {getHighlightedText(formatCurrency(action.vlrliquidado), searchTerm)}</p>
                          <p><strong>Total Pago:</strong> {getHighlightedText(formatCurrency(action.vlrtotalpago), searchTerm)}</p>
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