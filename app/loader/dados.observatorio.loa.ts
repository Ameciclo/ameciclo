import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch("https://cms.ameciclo.org/plataforma-de-dados");
    if (!response.ok) {
      throw new Response("Erro ao buscar os dados", { status: response.status });
    }

    const data = await response.json();
    const { cover, description } = data;

    const totalGoodActions2023 = [
      {
        cod: 3001,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1590,
        subname: "Ações de Mitigação e Adaptação às Mudanças Climáticas",
        total: 5150000,
      },
      {
        cod: 3002,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1028,
        subname: "Conservação de Recursos Hídricos",
        total: 3340000,
      },
      {
        cod: 3003,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1576,
        subname: "Proteção de Áreas de Preservação",
        total: 2240000,
      },
      {
        cod: 3004,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1577,
        subname: "Energias Renováveis",
        total: 8640000,
      },
      {
        cod: 3005,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 2032,
        subname: "Desenvolvimento Sustentável",
        total: 4795000,
      },
    ];

    const totalBadActions2023 = [
      {
        cod: 4001,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1012,
        subname: "Expansão da Malha Viária",
        total: 12300000,
      },
      {
        cod: 4002,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1013,
        subname: "Exploração de Recursos Não-Renováveis",
        total: 8960000,
      },
      {
        cod: 4003,
        name: "PROGRAMA ESTADUAL (2023)",
        subcod: 1014,
        subname: "Infraestrutura de Transporte Rodoviário",
        total: 15285000,
      },
    ];

    const totalValueBudgeted2020 = 18500000;
    const totalValueBudgeted2021 = 21300000;
    const totalValueBudgeted2022 = 19800000;
    const totalValueBudgeted2023 = 24165000;

    const totalValueExecuted2020 = 15200000;
    const totalValueExecuted2021 = 18700000;
    const totalValueExecuted2022 = 17500000;
    const totalValueExecuted2023 = 20100000;

    const totalValueActions2020 = 145000000;
    const totalValueActions2021 = 158000000;
    const totalValueActions2022 = 172000000;
    const totalValueActions2023 = 186000000;

    const totalValueEmissions = 3045.957;

    const actions2023 = [...totalGoodActions2023, ...totalBadActions2023];

    return json({
      cover,
      description,
      totalGoodActions2023,
      totalBadActions2023,
      totalValueBudgeted2020,
      totalValueBudgeted2021,
      totalValueBudgeted2022,
      totalValueBudgeted2023,
      totalValueExecuted2020,
      totalValueExecuted2021,
      totalValueExecuted2022,
      totalValueExecuted2023,
      totalValueActions2020,
      totalValueActions2021,
      totalValueActions2022,
      totalValueActions2023,
      totalValueEmissions,
      actions2023
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return json({
      cover: null,
      description: "",
      totalGoodActions2023: [],
      totalBadActions2023: [],
      totalValueBudgeted2020: 0,
      totalValueBudgeted2021: 0,
      totalValueBudgeted2022: 0,
      totalValueBudgeted2023: 0,
      totalValueExecuted2020: 0,
      totalValueExecuted2021: 0,
      totalValueExecuted2022: 0,
      totalValueExecuted2023: 0,
      totalValueActions2020: 0,
      totalValueActions2021: 0,
      totalValueActions2022: 0,
      totalValueActions2023: 0,
      totalValueEmissions: 0,
      actions2023: []
    });
  }
};