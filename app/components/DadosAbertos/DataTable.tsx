import { useState } from "react";

function orderHeaders(headers: string[]) {
    const priorityHeaders = [
        "cd_funcao", "cd_nm_funcao",
        "cd_prog", "cd_nm_prog",
        "cd_acao", "cd_nm_acao",
        "cd_subacao", "cd_nm_subacao",
        "cd_subfuncao", "cd_nm_subfuncao"
    ];

    const prioritized = headers.filter(h => priorityHeaders.includes(h));
    const others = headers.filter(h => !priorityHeaders.includes(h) && isNaN(Number(h)));
    const values = headers.filter(h => !priorityHeaders.includes(h) && !isNaN(Number(h)));

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

export default function DataTable({ data, search = "", page = 0, itemsPerPage = 10 }: { data: any[], search?: string, page?: number, itemsPerPage?: number }) {
    const headers = data.length > 0 ? orderHeaders(Object.keys(data[0])) : [];
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

    const toggleColumn = (header: string) => {
        setHiddenColumns((prev) =>
            prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header]
        );
    };

    const visibleHeaders = ["#", ...headers.filter(h => !hiddenColumns.includes(h))];

    const highlightText = (text: string) => {
        if (!search) return text;
        const regex = new RegExp(`(${search})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
        );
    };

    const startIdx = page * itemsPerPage;
    const pageData = data.slice(startIdx, startIdx + itemsPerPage);

    return (
        <div className="overflow-x-auto">
            <label className="block mb-2 text-sm font-semibold">Campos visíveis</label>
            <div className="flex flex-wrap gap-2 mb-4">
                {headers.map((header) => (
                    <button
                        key={header}
                        onClick={() => toggleColumn(header)}
                        className={`px-2 py-1 border rounded text-xs transition ${
                          hiddenColumns.includes(header)
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-gray-800 text-white'
                        }`}
                    >
                    {getHeaderLabel(header)}
                    </button>
                ))}
            </div>

            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr>
                        {visibleHeaders.map((header) => (
                            <th
                                key={header}
                                className="border px-2 py-1 text-sm bg-gray-100"
                            >
                                {header === "#" ? "Índice" : getHeaderLabel(header)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border px-2 py-1 text-xs">{startIdx + idx + 1}</td>
                            {visibleHeaders.slice(1).map((header) => (
                                <td key={header} className="border px-2 py-1 text-xs">
                                    {highlightText(row[header]?.toString() ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
