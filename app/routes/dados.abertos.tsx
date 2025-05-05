import {
    json,
    LoaderFunctionArgs,
} from "@remix-run/node";
import {
    useLoaderData,
    useNavigate,
    useNavigation,
    useLocation,
} from "@remix-run/react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* ---------------------------- LOADER ------------------------------ */
/* ------------------------------------------------------------------ */
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    /* ---------- busca texto ---------- */
    const query = url.searchParams.get("q")?.toLowerCase() ?? "";
    const queryTokens = query.split(/\s+/).filter(Boolean);
    const searchFields = (url.searchParams.get("searchFields") ?? "")
        .split(",")
        .filter(Boolean);

    /* ---------- filtros numéricos A > valor ---------- */
    const vf = url.searchParams.getAll("vf");
    const op = url.searchParams.getAll("op");
    const val = url.searchParams.getAll("val");
    const numberFilters = vf.map((field, i) => ({
        field,
        op: op[i] ?? ">",
        value:
            val[i] !== undefined
                ? parseFloat(val[i].replace(",", "."))
                : NaN,
    }));

    /* ---------- NOVO: comparações Campo A op Campo B ---------- */
    const cf = url.searchParams.getAll("cf");   // column-from
    const cop = url.searchParams.getAll("cop");  // operator
    const ct = url.searchParams.getAll("ct");   // column-to
    const crossFilters = cf.map((from, i) => ({
        from,
        op: cop[i] ?? ">",
        to: ct[i] ?? "",
    }));

    /* ---------- categóricos ---------- */
    const funcaoEquals = url.searchParams.getAll("funcao");
    const progLikes = url.searchParams
        .getAll("prog_like")
        .map((s) => s.toLowerCase());

    /* ---------- paginação & ordenação ---------- */
    const sort = url.searchParams.get("sort") ?? "";
    const direction = url.searchParams.get("direction") ?? "asc";
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage") ?? "10", 10);

    /* ---------- dataset ---------- */
    const res = await fetch(
        "https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json"
    );
    const data = await res.json();
    let resultados = (data.campos ?? []) as any[];

    /* ---------- aplica filtros ---------- */
    resultados = resultados.filter((item) => {
        /* campos textuais para busca livre */
        const selectable = {
            cd_nm_acao: item.cd_nm_acao,
            cd_nm_prog: item.cd_nm_prog,
            cd_nm_funcao: item.cd_nm_funcao,
            cd_nm_subacao: item.cd_nm_subacao,
        };

        const fields = Object.entries(selectable)
            .filter(([k]) => searchFields.length === 0 || searchFields.includes(k))
            .map(([, v]) => String(v ?? "").toLowerCase());

        const matchesQuery =
            queryTokens.length === 0 ||
            queryTokens.every((t) => fields.some((f) => f.includes(t)));

        /* valor fixo */
        const matchesNumbers = numberFilters.every(({ field, op, value }) => {
            if (!field || Number.isNaN(value)) return true;
            const num = parseFloat(String(item[field] ?? "0").replace(",", "."));
            if (op === ">") return num > value;
            if (op === "<") return num < value;
            return num === value;
        });

        /* campo vs campo */
        const matchesCross = crossFilters.every(({ from, op, to }) => {
            if (!from || !to) return true;
            const a = parseFloat(String(item[from] ?? "0").replace(",", "."));
            const b = parseFloat(String(item[to] ?? "0").replace(",", "."));
            if (op === ">") return a > b;
            if (op === "<") return a < b;
            return a === b;
        });

        /* categóricos */
        const matchesCategoria =
            (funcaoEquals.length === 0 ||
                funcaoEquals.includes(String(item.cd_nm_funcao))) &&
            (progLikes.length === 0 ||
                progLikes.some((p) =>
                    String(item.cd_nm_prog ?? "").toLowerCase().includes(p)
                ));

        return (
            matchesQuery &&
            matchesNumbers &&
            matchesCross &&
            matchesCategoria
        );
    });

    /* ---------- ordenação ---------- */
    const sortKeys = sort.split(",").filter(Boolean).map((s) => s.trim());
    if (sortKeys.length) {
        resultados.sort((a: any, b: any) => {
            for (const raw of sortKeys) {
                const desc = raw.startsWith("-");
                const key = desc ? raw.slice(1) : raw;
                const av = String(a[key] ?? "").toLowerCase();
                const bv = String(b[key] ?? "").toLowerCase();
                if (av < bv) return desc ? 1 : -1;
                if (av > bv) return desc ? -1 : 1;
            }
            return 0;
        });
    }

    /* ---------- paginação ---------- */
    const total = resultados.length;
    const totalPages = Math.max(Math.ceil(total / perPage), 1);
    const validPage = Math.min(Math.max(page, 1), totalPages);
    const paginated = resultados.slice(
        (validPage - 1) * perPage,
        validPage * perPage
    );

    return json({
        results: paginated,
        total,
        totalPages,
        page: validPage,
        perPage,

        /* devolve estado p/ UI */
        query,
        searchFields,
        numberFilters,
        crossFilters,
        funcaoEquals,
        progLikes,
        sort,
        direction,
    });
};

/* ------------------------------------------------------------------ */
/* -------------------------  COMPONENTE ---------------------------- */
/* ------------------------------------------------------------------ */

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

const CURRENCY_KEYS = ALL_COLUMNS.map((c) => c.key).filter((k) =>
    k.startsWith("vlr")
);

const formatCurrency = (n: number) =>
    Number(n || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

export default function DadosAbertos() {
    const data = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    const navigate = useNavigate();
    const location = useLocation();

    /* ---------- estados p/ form ---------- */
    const [q, setQ] = useState(data.query);
    const [searchFields, setSearchFields] = useState<string[]>(data.searchFields);

    const [numberFilters, setNumberFilters] = useState<
        { field: string; op: string; val: string }[]
    >(data.numberFilters.map((f) => ({
        field: f.field,
        op: f.op,
        val: Number.isNaN(f.value) ? "" : f.value.toString(),
    }))
    );

    const [crossFilters, setCrossFilters] = useState<
        { from: string; op: string; to: string }[]
    >(data.crossFilters);

    const [funcaoEquals, setFuncaoEquals] = useState(data.funcaoEquals);
    const [progLikes, setProgLikes] = useState(data.progLikes);

    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        "cd_nm_acao",
        "vlrempenhado",
        "vlrtotalpago",
    ]);
    const [pageInput, setPageInput] = useState(data.page.toString());

    /* ---------- helpers ---------- */
    const buildQuery = (pageOverride?: number) => {
        const p = new URLSearchParams();

        if (q) p.set("q", q);
        if (searchFields.length) p.set("searchFields", searchFields.join(","));

        numberFilters.forEach(({ field, op, val }) => {
            if (!field || !val) return;
            p.append("vf", field);
            p.append("op", op);
            p.append("val", val.replace(",", "."));
        });

        crossFilters.forEach(({ from, op, to }) => {
            if (!from || !to) return;
            p.append("cf", from);
            p.append("cop", op);
            p.append("ct", to);
        });

        funcaoEquals.forEach((f) => p.append("funcao", f));
        progLikes.forEach((f) => p.append("prog_like", f));

        if (data.sort) p.set("sort", data.sort);
        if (data.direction) p.set("direction", data.direction);
        p.set("perPage", data.perPage.toString());
        p.set("page", (pageOverride ?? data.page).toString());

        return p.toString();
    };

    const goto = (p?: number) =>
        navigate(`${location.pathname}?${buildQuery(p)}`);

    /* ---------- animação linhas ---------- */
    const fadeStyle = (idx: number) => ({
        animation: "fadeIn 0.2s ease forwards",
        animationDelay: `${idx * 0.001}s`, // 1 ms
        opacity: 0,
    });

    /* ---------- UI ---------- */
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">
                Ações e Programas – Dados Abertos PE
            </h1>

            {/* ---------------- FORM ---------------- */}
            <section className="border p-4 rounded space-y-4">
                {/* busca livre */}
                <div>
                    <label className="block font-semibold">Buscar:</label>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="border p-2 w-80"
                        placeholder="ex: saúde educação"
                    />
                </div>

                {/* campos onde buscar */}
                <details>
                    <summary className="cursor-pointer font-medium text-blue-600">
                        Campos onde buscar
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {["cd_nm_acao", "cd_nm_prog", "cd_nm_funcao", "cd_nm_subacao"].map(
                            (f) => {
                                const active = searchFields.includes(f);
                                return (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() =>
                                            setSearchFields((prev) =>
                                                active ? prev.filter((x) => x !== f) : [...prev, f]
                                            )
                                        }
                                        className={`px-2 py-1 rounded text-sm border ${active
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {ALL_COLUMNS.find((c) => c.key === f)?.label}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </details>

                {/* Filtros numéricos campo > valor */}
                <details>
                    <summary className="cursor-pointer font-medium text-blue-600">
                        Filtros numéricos (campo × valor)
                    </summary>
                    <div className="mt-2 space-y-2">
                        {numberFilters.map((nf, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 border p-2 rounded"
                            >
                                <select
                                    value={nf.field}
                                    onChange={(e) =>
                                        setNumberFilters((arr) =>
                                            arr.map((v, i) =>
                                                i === idx ? { ...v, field: e.target.value } : v
                                            )
                                        )
                                    }
                                    className="border p-1"
                                >
                                    <option value="">Campo…</option>
                                    {ALL_COLUMNS.filter((c) => c.label.includes("Valor")).map(
                                        (c) => (
                                            <option key={c.key} value={c.key}>
                                                {c.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                <select
                                    value={nf.op}
                                    onChange={(e) =>
                                        setNumberFilters((arr) =>
                                            arr.map((v, i) =>
                                                i === idx ? { ...v, op: e.target.value } : v
                                            )
                                        )
                                    }
                                    className="border p-1"
                                >
                                    <option value=">">Maior que</option>
                                    <option value="<">Menor que</option>
                                    <option value="=">Igual a</option>
                                </select>

                                <input
                                    placeholder="valor"
                                    value={nf.val}
                                    onChange={(e) =>
                                        setNumberFilters((arr) =>
                                            arr.map((v, i) =>
                                                i === idx ? { ...v, val: e.target.value } : v
                                            )
                                        )
                                    }
                                    className="border p-1 w-28"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setNumberFilters((arr) => arr.filter((_, i) => i !== idx))
                                    }
                                    className="text-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setNumberFilters((arr) => [
                                    ...arr,
                                    { field: "", op: ">", val: "" },
                                ])
                            }
                            className="text-blue-600 font-medium"
                        >
                            + adicionar filtro
                        </button>
                    </div>
                </details>

                {/* NOVO: Comparar campos */}
                <details>
                    <summary className="cursor-pointer font-medium text-blue-600">
                        Comparar campos (campo × campo)
                    </summary>
                    <div className="mt-2 space-y-2">
                        {crossFilters.map((f, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 border p-2 rounded"
                            >
                                {/* Campo A */}
                                <select
                                    value={f.from}
                                    onChange={(e) =>
                                        setCrossFilters((arr) =>
                                            arr.map((v, i) =>
                                                i === idx ? { ...v, from: e.target.value } : v
                                            )
                                        )
                                    }
                                    className="border p-1"
                                >
                                    <option value="">Campo A…</option>
                                    {ALL_COLUMNS.filter((c) => c.label.includes("Valor")).map(
                                        (c) => (
                                            <option key={c.key} value={c.key}>
                                                {c.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                {/* Operador */}
                                <select
                                    value={f.op}
                                    onChange={(e) =>
                                        setCrossFilters((arr) =>
                                            arr.map((v, i) =>
                                                i === idx ? { ...v, op: e.target.value } : v
                                            )
                                        )
                                    }
                                    className="border p-1"
                                >
                                    <option value=">">Maior que</option>
                                    <option value="<">Menor que</option>
                                    <option value="=">Igual a</option>
                                </select>

                                {/* Campo B */}
                                <select
                                    value={f.to}
                                    onChange={(e) =>
                                        setCrossFilters((arr) =>
                                            arr.map((v, i) =>
                                                i === idx ? { ...v, to: e.target.value } : v
                                            )
                                        )
                                    }
                                    className="border p-1"
                                >
                                    <option value="">Campo B…</option>
                                    {ALL_COLUMNS.filter((c) => c.label.includes("Valor")).map(
                                        (c) => (
                                            <option key={c.key} value={c.key}>
                                                {c.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                {/* remove */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCrossFilters((arr) => arr.filter((_, i) => i !== idx))
                                    }
                                    className="text-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setCrossFilters((arr) => [
                                    ...arr,
                                    { from: "", op: ">", to: "" },
                                ])
                            }
                            className="text-blue-600 font-medium"
                        >
                            + comparar campos
                        </button>

                        {/* Exemplo rápido: Pago > Empenhado */}
                        <button
                            type="button"
                            onClick={() =>
                                setCrossFilters([{ from: "vlrpago", op: ">", to: "vlrempenhado" }])
                            }
                            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm"
                        >
                            (Atalho) Pago &gt; Empenhado
                        </button>
                    </div>
                </details>

                {/* filtros categóricos */}
                <details>
                    <summary className="cursor-pointer font-medium text-blue-600">
                        Filtros categóricos
                    </summary>
                    <div className="mt-3 space-y-3">
                        {/* Função */}
                        <div>
                            <label className="font-semibold">Função:</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {funcaoEquals.map((f, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                                    >
                                        {f}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFuncaoEquals((arr) => arr.filter((_, idx) => idx !== i))
                                            }
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    placeholder="Adicionar…"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const val =
                                                (e.target as HTMLInputElement).value.trim();
                                            if (val) {
                                                setFuncaoEquals((prev) => [...prev, val]);
                                                (e.target as HTMLInputElement).value = "";
                                            }
                                        }
                                    }}
                                    className="border p-1 w-24"
                                />
                            </div>
                        </div>

                        {/* Programa contém */}
                        <div>
                            <label className="font-semibold">Programa contém:</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {progLikes.map((p, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                                    >
                                        {p}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setProgLikes((arr) => arr.filter((_, idx) => idx !== i))
                                            }
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    placeholder="Adicionar…"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const val =
                                                (e.target as HTMLInputElement).value.trim();
                                            if (val) {
                                                setProgLikes((prev) => [
                                                    ...prev,
                                                    val.toLowerCase(),
                                                ]);
                                                (e.target as HTMLInputElement).value = "";
                                            }
                                        }
                                    }}
                                    className="border p-1 w-40"
                                />
                            </div>
                        </div>
                    </div>
                </details>

                <button
                    type="button"
                    onClick={() => goto(1)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Buscar
                </button>

                <div>Total encontrados: {data.total}</div>
            </section>

            {/* ---------------- TABELA ---------------- */}
            <section className="relative">
                {/* botão colunas (top-right) */}
                <details className="absolute left-0 p-3 -top-10">
                    <summary className="cursor-pointer px-2 text-sm bg-gray-200 rounded">
                        Colunas
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-2 bg-white border p-3 rounded shadow-lg">
                        {ALL_COLUMNS.map((c) => {
                            const active = visibleColumns.includes(c.key);
                            return (
                                <button
                                    key={c.key}
                                    type="button"
                                    onClick={() =>
                                        setVisibleColumns((prev) =>
                                            active
                                                ? prev.filter((x) => x !== c.key)
                                                : [...prev, c.key]
                                        )
                                    }
                                    className={`px-2 py-1 rounded text-sm border ${active
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </details>

                {/* overlay loading só na tabela */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                        <div className="animate-pulse font-medium">
                            Carregando dados…
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto mt-4 rounded border border-gray-200">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                {ALL_COLUMNS.filter((c) =>
                                    visibleColumns.includes(c.key)
                                ).map((c) => (
                                    <th
                                        key={c.key}
                                        className="border-b border-gray-300 p-2 text-left text-sm font-semibold text-gray-700"
                                    >
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.results.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={visibleColumns.length}
                                        className="text-center p-4 italic"
                                    >
                                        Nenhum resultado
                                    </td>
                                </tr>
                            ) : (
                                data.results.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="odd:bg-gray-50"
                                        style={fadeStyle(i)}
                                    >
                                        {ALL_COLUMNS.filter((c) =>
                                            visibleColumns.includes(c.key)
                                        ).map((c) => (
                                            <td
                                                key={c.key}
                                                className="border-b border-gray-200 p-2 text-sm"
                                            >
                                                {CURRENCY_KEYS.includes(c.key)
                                                    ? formatCurrency(row[c.key])
                                                    : row[c.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---------------- PAGINAÇÃO ---------------- */}
            <section className="flex items-center gap-4">
                <button
                    disabled={data.page === 1}
                    onClick={() => goto(data.page - 1)}
                    className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
                >
                    ←
                </button>

                <span>
                    Página{" "}
                    <input
                        type="number"
                        min={1}
                        max={data.totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const n = parseInt(pageInput, 10);
                                if (!Number.isNaN(n)) goto(n);
                            }
                        }}
                        onBlur={() => {
                            const n = parseInt(pageInput, 10);
                            if (!Number.isNaN(n) && n >= 1 && n <= data.totalPages) goto(n);
                            else setPageInput(data.page.toString());
                        }}
                        className="border p-1 w-16 text-center"
                    />{" "}
                    de {data.totalPages}
                </span>

                <button
                    disabled={data.page === data.totalPages}
                    onClick={() => goto(data.page + 1)}
                    className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
                >
                    →
                </button>
            </section>

            {/* keyframes animação */}
            <style>
                {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}
            </style>
        </div>
    );
}
