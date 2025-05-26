import {
    json,
    LoaderFunctionArgs,
} from "@remix-run/node";
import {
    useLoaderData,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import DataTable from "~/components/DadosAbertos/DataTable";

function normalizeString(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function searchByTerms(item: any, terms: string) {
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

function compareFilter(item: any, field: string, value: string, operator: string) {
    const itemValue = Number(item[field]);
    const filterValue = Number(value);

    if (isNaN(itemValue) || isNaN(filterValue)) return false;

    if (operator === "equal") return itemValue === filterValue;
    if (operator === "greater") return itemValue > filterValue;
    if (operator === "less") return itemValue < filterValue;

    return false;
}

let cache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60;

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
    }

    return json({ data });
};

export default function DadosAbertos() {
    const { data: serverData } = useLoaderData<typeof loader>();
    const [data, setData] = useState<any[]>(serverData);

    const [searchTerm, setSearchTerm] = useState("");
    const [field, setField] = useState("");
    const [operator, setOperator] = useState("equal");
    const [filterValue, setFilterValue] = useState("");
    const [showFieldFilter, setShowFieldFilter] = useState(false);

    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        let filtered = [...serverData];

        if (searchTerm) {
            filtered = filtered.filter((item) => searchByTerms(item, searchTerm));
        }

        if (field && filterValue) {
            filtered = filtered.filter((item) =>
                compareFilter(item, field, filterValue, operator)
            );
        }

        setData(filtered);
        setPage(1);
    }, [searchTerm, field, operator, filterValue, serverData]);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

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
                    onClick={() => setShowFieldFilter(!showFieldFilter)}
                    className="flex items-center w-full text-sm font-semibold text-gray-700"
                >
                    <span>Filtro por Campo de Valores</span>
                    <span className="text-black font-bold left pl-4">
                        {showFieldFilter ? "▲" : "▼"}
                    </span>
                </button>


                {showFieldFilter && (
                    <div className="flex gap-2">
                        <select
                            value={field}
                            onChange={(e) => setField(e.target.value)}
                            className="border px-2 py-1 rounded"
                        >
                            <option value="">Campo</option>
                            {serverData.length > 0 &&
                                Object.keys(serverData[0])
                                    .filter((key) => key.toLowerCase().includes("vlr"))
                                    .map((key) => (
                                        <option key={key} value={key}>
                                            {getHeaderLabel(key)}
                                        </option>
                                    ))}
                        </select>

                        <select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value)}
                            className="border px-2 py-1 rounded"
                        >
                            <option value="equal">IGUAL</option>
                            <option value="greater">MAIOR QUE</option>
                            <option value="less">MENOR QUE</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Valor"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="border px-2 py-1 rounded"
                        />
                    </div>
                )}
            </div>

            <DataTable data={paginatedData} />

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border px-2 py-1 rounded disabled:opacity-50"
                >
                    Anterior
                </button>
                <span>
                    Página {page} de {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border px-2 py-1 rounded disabled:opacity-50"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}
