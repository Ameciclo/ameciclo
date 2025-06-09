import { json, type LoaderFunction } from "@remix-run/node";

export interface Action {
  cod: number;
  name: string;
  subcod: number;
  subname: string;
  total: number;
}

export const loader: LoaderFunction = async () => {
  try {
    // No futuro, substituir por chamada à API real
    // const response = await fetch("https://api.example.com/dom-data");
    // if (!response.ok) {
    //   throw new Error("Falha ao carregar dados da API");
    // }
    // const data = await response.json();
    
    // Por enquanto, usando dados mockados
    const totalGoodActions: any[] = [
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

    const totalBadActions: any[] = [
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
      totalGoodActions,
      totalBadActions,
      chartData,
      sustainableTotal: 35175000,
      unsustainableTotal: 148715000,
      carbonValue: 3045.957
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({ 
      error: "Falha ao carregar dados",
      totalGoodActions: [],
      totalBadActions: [],
      chartData: {
        yearlyComparison: [],
        goodActionsYearly: [],
        totalSpendingYearly: []
      },
      sustainableTotal: 0,
      unsustainableTotal: 0,
      carbonValue: 0
    });
  }
};