import {
    json,
    LoaderFunctionArgs,
} from "@remix-run/node";
import {
    useLoaderData,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import DataTable from "~/components/DadosAbertos/DataTable";

// Utils
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

// Loader
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
        setPage(1); // Resetar para página 1 sempre que filtrar
    }, [searchTerm, field, operator, filterValue, serverData]);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Ações e Programas – Dados Abertos PE</h1>

            <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Buscar texto (ignora acentos e caps)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />

                <div className="flex gap-2">
                    <select
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">-- Campo --</option>
                        {serverData.length > 0 &&
                            Object.keys(serverData[0]).map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                    </select>

                    <select
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="equal">=</option>
                        <option value="greater">{">"}</option>
                        <option value="less">{"<"}</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Valor"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                </div>
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
