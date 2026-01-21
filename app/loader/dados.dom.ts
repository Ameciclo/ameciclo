import { json, LoaderFunction } from "@remix-run/node";
import { LOA_RMR_ATLAS_API } from "~/servers";

export const loader: LoaderFunction = async () => {
    const errors: Array<{url: string, error: string}> = [];
    
    // TODO: Integração Strapi v5 - Descomentar quando API estiver disponível
    // const onError = (url: string) => (error: string) => {
    //   errors.push({ url, error });
    // };
    // const pageData = await fetchWithTimeout(
    //   DOM_PAGE_DATA,
    //   { cache: "no-cache" },
    //   5000,
    //   null,
    //   onError(DOM_PAGE_DATA)
    // );
    // const cover = pageData?.data?.cover || null;
    // const description = pageData?.data?.description || "";

    // TODO: Integração API Atlas LOA-RMR - Descomentar quando API estiver disponível
    // const atlasData = await fetchWithTimeout(
    //   LOA_RMR_ATLAS_API,
    //   { cache: "no-cache" },
    //   15000,
    //   null,
    //   onError(LOA_RMR_ATLAS_API)
    // );
    // Estrutura esperada (armazenar dados exatamente como vêm da API):
    // {
    //   goodActions: [...],
    //   badActions: [...],
    //   chartData: { yearlyComparison, goodActionsYearly, totalSpendingYearly },
    //   totals: { sustainable, unsustainable, carbon }
    // }
    // Substituir dados estáticos por processamento do atlasData

    const cover = { url: "/pages_covers/dom-cover.jpg" };
    const description = "O Diagnóstico Orçamentário Municipal é uma iniciativa que visa integrar práticas de mobilidade sustentável nas políticas públicas por meio da análise do orçamento público. Com foco na promoção de sistemas de transporte eficientes e ecológicos, o plano busca incorporar diretrizes que fomentar a utilização de bicicletas e outros meios de transporte sustentável nas cidades. Além de estudar a alocação de recursos, o projeto propõe estratégias que envolvam a participação da sociedade civil e do poder público para a melhoria da mobilidade sustentável. Assim, o plano não apenas mapeia as necessidades atuais, mas também projeta um futuro mais sustentável e acessível, contribuindo para a melhoria da qualidade da vida urbana.";

        const totalGoodActions = [
            {
                cod: 5011,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1590,
                subname: "Requalificação Urbanística E Inclusão Social Da Comunidade do Pilar",
                total: 3150000,
            },
            {
                cod: 5011,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1028,
                subname: "Ampliação E Melhoria Da Infraestrutura Urbana",
                total: 4340000,
            },
            {
                cod: 5011,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1576,
                subname: "Urbanização Das Margens De Rios E Canais",
                total: 4240000,
            },
            {
                cod: 5011,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1577,
                subname: "Projeto Capibaribe Melhor",
                total: 14640000,
            },
            {
                cod: 6401,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 2032,
                subname: "Ações Para O Desenvolvimento Da Cidade Sustentável",
                total: 8795.000,
            },
            {
                cod: 6401,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 2042,
                subname: " Promoção Da Gestão E A Articulação Das Ações Ambientais",
                total: 10000,
            },
        ];

        const totalBadActions = [
            {
                cod: 1012,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1012,
                subname: "Requalificação Da Mobilidade Urbana - Via Mangue",
                total: 300000,
            },
            {
                cod: 1563,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1012,
                subname: "Consolidação E Melhoramento Do Sistema Viário",
                total: 63960000,
            },
            {
                cod: 2510,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1012,
                subname: "Gerenciamento Do Trânsito E Do Transporte Público",
                total: 67285000,
            },
            {
                cod: 1035,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1012,
                subname: "Expansão E Melhoria Da Infraestrutura Da Cttu",
                total: 10000,
            },
            {
                cod: 2723,
                name: "PROJETO / ATIVIDADE / OPERÇÃO ESPECIAL (2024)",
                subcod: 1012,
                subname: "Apoio Administrativo Às Ações Da Unidade Orçamentária ",
                total: 17160000,
            }
        ];

        const chartData = {
            yearlyComparison: [
                ["Ano", "Sustentável (R$)", 'Não sustentável (R$)'],
                ['2021', 111884449, 75073016],
                ['2023', 11315000, 171801000],
                ['2024', 35175000, 148715000],
            ],
            goodActionsYearly: [
                ["Ano", "Orçado em boas ações"],
                ['2021', 111884449],
                ['2023', 11315000],
                ['2024', 35175000],
            ],
            totalSpendingYearly: [
                ["Ano", "Total Boas/Más"],
                ['2021', 186957465],
                ['2023', 183116000],
                ['2024', 183890000],
            ]
        };

        return json({
            cover,
            description,
            totalGoodActions,
            totalBadActions,
            chartData,
            sustainableTotal: 35175000,
            unsustainableTotal: 148715000,
            carbonValue: 3045.957,
            apiDown: errors.length > 0,
            apiErrors: errors
        });
};
