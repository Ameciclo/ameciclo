import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/bd2f90f2-3cc1-4b46-ab8d-9b15a1b0d453/download/acoes_e_programas_json_2025_20250716.json");
    if (!response.ok) {
      throw new Response("Erro ao buscar os dados", { status: response.status });
    }

    const data = await response.json();
    const actions2023 = data.campos;

    // Mock data for other values, since the new API only provides actions
    const cover = { url: "" };
    const description = "";
    const totalValueBudgeted2020 = 0;
    const totalValueBudgeted2021 = 0;
    const totalValueBudgeted2022 = 0;
    const totalValueBudgeted2023 = 0;
    const totalValueExecuted2020 = 0;
    const totalValueExecuted2021 = 0;
    const totalValueExecuted2022 = 0;
    const totalValueExecuted2023 = 0;
    const totalValueActions2020 = 0;
    const totalValueActions2021 = 0;
    const totalValueActions2022 = 0;
    const totalValueActions2023 = 0;
    const totalValueEmissions = 0;

    return json({
      cover,
      description,
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