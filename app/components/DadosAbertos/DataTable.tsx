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

export default function DataTable({ data }: { data: any[] }) {
    const headers = data.length > 0 ? orderHeaders(Object.keys(data[0])) : [];
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

    const toggleColumn = (header: string) => {
        setHiddenColumns((prev) =>
            prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header]
        );
    };

    const visibleHeaders = headers.filter(h => !hiddenColumns.includes(h));

    return (
        <div className="overflow-x-auto">
            <div className="flex flex-wrap gap-2 mb-2">
                {headers.map((header) => (
                    <button
                        key={header}
                        onClick={() => toggleColumn(header)}
                        className={`px-2 py-1 border rounded text-xs ${
                            hiddenColumns.includes(header) ? 'bg-gray-300' : 'bg-white'
                        }`}
                    >
                        {hiddenColumns.includes(header) ? 'Mostrar' : 'Ocultar'} {header}
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
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            {visibleHeaders.map((header) => (
                                <td key={header} className="border px-2 py-1 text-xs">
                                    {row[header]?.toString() ?? ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
