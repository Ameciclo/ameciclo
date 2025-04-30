import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase() || "";
    const operator = url.searchParams.get("valueOperator") || "";
    const rawValue = (url.searchParams.get("value") || "0").replace(",", ".");
    const filterValue = parseFloat(rawValue);
    const valueField = url.searchParams.get("valueField") || "vlrtotalpago";
    const sort = url.searchParams.get("sort") || "";
    const direction = url.searchParams.get("direction") || "asc";
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("perPage") || "10");

    const res = await fetch(
        "https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json"
    );
    const data = await res.json();
    let resultados = (data.campos || []) as any[];

    resultados = resultados.filter((item) => {
        const fields = [
            item.cd_nm_acao,
            item.cd_nm_prog,
            item.cd_nm_funcao,
            item.cd_nm_subacao,
        ]
            .filter(Boolean)
            .map((s) => s.toLowerCase());
        const matchesQuery = query === "" || fields.some((f) => f.includes(query));
        const raw = String(item[valueField] ?? "0").replace(",", ".");
        const valor = parseFloat(raw);

        let matchesValue = true;
        if (operator === ">") matchesValue = valor > filterValue;
        else if (operator === "<") matchesValue = valor < filterValue;
        else if (operator === "=") matchesValue = valor === filterValue;

        return matchesQuery && matchesValue;
    });

    if (sort) {
        resultados.sort((a: any, b: any) => {
            const va = String(a[sort] ?? "").toLowerCase();
            const vb = String(b[sort] ?? "").toLowerCase();
            if (va < vb) return direction === "asc" ? -1 : 1;
            if (va > vb) return direction === "asc" ? 1 : -1;
            return 0;
        });
    }

    const total = resultados.length;
    const totalPages = Math.ceil(total / perPage);
    const validPage = Math.min(Math.max(page, 1), totalPages || 1);
    const paginated = resultados.slice(
        (validPage - 1) * perPage,
        validPage * perPage
    );

    return json({
        results: paginated,
        total,
        totalPages,
        query,
        operator,
        value: rawValue,
        sort,
        direction,
        page: validPage,
        perPage,
        valueField,
    });
};

const ALL_COLUMNS = [
    { key: "cd_nm_funcao", label: "Função" },
    { key: "cd_nm_prog", label: "Programa" },
    { key: "cd_nm_acao", label: "Ação" },
    { key: "cd_nm_subacao", label: "Subação" },
    { key: "vlrdotatualizada", label: "Valor Atualizado" },
    { key: "vlrliqemp", label: "Valor Liquidado Empenho" },
    { key: "vlrempenhado", label: "Valor Empenhado" },
    { key: "vlrpago", label: "Valor Pago" },
    { key: "vlrpagoemp", label: "Valor Pago Empenho" },
    { key: "vlrtotalpago", label: "Valor Total Pago" },
    { key: "vlrliquidado", label: "Valor Liquidado" },
];

const formatCurrency = (value: number) => {
    if (!value) return (0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
};

export default function DadosAbertos() {
    const {
        results,
        total,
        totalPages,
        query,
        operator,
        value,
        sort,
        direction,
        page,
        perPage,
        valueField,
    } = useLoaderData<typeof loader>();

    const [params, setParams] = useState({
        q: query,
        valueOperator: operator,
        value,
        valueField,
        sort,
        direction,
        page,
        perPage,
    });
    const [showValueFilters, setShowValueFilters] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        "cd_nm_acao", "vlrempenhado", "vlrtotalpago" // Colunas visíveis por padrão
    ]);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const p = new URLSearchParams();
        if (params.q) p.set("q", params.q);
        if (params.valueOperator) p.set("valueOperator", params.valueOperator);
        if (params.value) p.set("value", params.value);
        p.set("valueField", params.valueField);
        if (params.sort) p.set("sort", params.sort);
        p.set("direction", params.direction);
        p.set("page", "1");
        p.set("perPage", params.perPage.toString());
        window.location.search = p.toString();
    };

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
        );
    };

    const renderFilterSummary = () => {
        const filters = [];
        if (params.q) filters.push(`Busca: "${params.q}"`);
        if (params.valueOperator && params.value) {
            filters.push(`${ALL_COLUMNS.find(col => col.key === params.valueField)?.label}: ${params.valueOperator} ${params.value}`);
        }
        if (filters.length > 0) {
            return (
                <div className="mb-4 p-2 bg-gray-100 border rounded">
                    <strong>Filtros aplicados:</strong> {filters.join(", ")}
                </div>
            );
        }
        return null;
    };

    const goToPage = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) {
            setError(`Página inválida. Entre 1 e ${totalPages}.`);
            return;
        }
        const p = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => p.set(k, String(v)));
        p.set("page", String(newPage));
        window.location.search = p.toString();
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParams({
            ...params,
            page: parseInt(e.target.value) || 1, // Atualiza o valor da página conforme o input
        });
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            goToPage(params.page);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Ações e Programas - Dados Abertos PE</h1>
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <div>
                    <label className="block">Buscar:
                        <input
                            type="text"
                            value={params.q}
                            onChange={(e) => setParams({ ...params, q: e.target.value })}
                            className="border p-2 w-80"
                        />
                    </label>
                </div>

                <div
                    className="cursor-pointer text-blue-600 font-medium"
                    onClick={() => setShowValueFilters(!showValueFilters)}
                >
                    Filtros de valor {showValueFilters ? '▲' : '▼'}
                </div>

                {showValueFilters && (
                    <div className="flex items-end space-x-4">
                        <select
                            value={params.valueField}
                            onChange={(e) => setParams({ ...params, valueField: e.target.value })}
                            className="border p-2"
                        >
                            {ALL_COLUMNS.filter((col) => col.label.includes("Valor")).map((col) => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                            ))}
                        </select>

                        <select
                            value={params.valueOperator}
                            onChange={(e) => setParams({ ...params, valueOperator: e.target.value })}
                            className="border p-2"
                        >
                            <option value="">Sem filtro</option>
                            <option value=">">Maior que</option>
                            <option value="<">Menor que</option>
                            <option value="=">Igual a</option>
                        </select>

                        <input
                            type="text"
                            value={params.value}
                            onChange={(e) => setParams({ ...params, value: e.target.value })}
                            placeholder="ex: 1234,56"
                            className="border p-2 w-40"
                        />
                    </div>
                )}

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Buscar
                </button>

                <p className="mb-2">Total de resultados encontrados: <strong>{total}</strong></p>
            </form>

            {renderFilterSummary()}

            <div
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="cursor-pointer text-blue-600 mb-4"
            >
                Ocultar/Exibir Colunas
            </div>
            
            {showColumnSelector && (
                <div className="fixed bottom-16 right-4 bg-white border p-4 rounded shadow-lg w-64">
                    <h2 className="font-semibold mb-2">Colunas Visíveis</h2>
                    <div className="flex flex-col space-y-1 max-h-48 overflow-auto">
                        {ALL_COLUMNS.map((col) => (
                            <label key={col.key} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(col.key)}
                                    onChange={() => toggleColumn(col.key)}
                                    className="mr-2"
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <table className="min-w-full mt-4 border-collapse">
                <thead>
                    <tr>
                        {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                            <th key={col.key} className="border-b py-2 px-4 text-left">{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.length === 0 ? (
                        <tr>
                            <td colSpan={ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).length} className="text-center py-4">Nenhum resultado encontrado</td>
                        </tr>
                    ) : (
                        results.map((item, idx) => (
                            <tr key={idx}>
                                {ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key)).map((col) => (
                                    <td key={col.key} className="border-b py-2 px-4">
                                        {col.key === "vlrtotalpago" || col.key === "vlrempenhado"
                                            ? formatCurrency(item[col.key])
                                            : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="flex justify-between mt-4">
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Anterior
                </button>

                <span className="text-sm">
                    Página{" "}
                    <input
                        type="number"
                        value={params.page}
                        onChange={handlePageInputChange}
                        onKeyDown={handlePageInputKeyDown}
                        className="border p-2 w-16 text-center"
                        min="1"
                        max={totalPages}
                    />{" "}
                    de {totalPages}
                </span>

                <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}
