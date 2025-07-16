import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const fetchYearlyData = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Error fetching data from ${url}:`, response.statusText);
        return { budgeted: 0, executed: 0 };
      }
      const data = await response.json();
      let budgeted = 0;
      let executed = 0;
      if (data.campos && Array.isArray(data.campos)) {
        data.campos.forEach((item: any) => {
          if (typeof item.vlrdotatualizada === 'number') {
            budgeted += item.vlrdotatualizada;
          }
          if (typeof item.vlrtotalpago === 'number') {
            executed += item.vlrtotalpago;
          }
        });
      }
      return { budgeted, executed };
    } catch (error) {
      console.error(`Error processing data from ${url}:`, error);
      return { budgeted: 0, executed: 0 };
    }
  };

  try {
    const [data2020, data2021, data2022, data2023, data2024, data2025] = await Promise.all([
      fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/5e5e1107-e1ed-4c2c-b258-e19a013f6caa/download/acoes_e_programas_json_2020_20201231.json"),
      fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/0a2e8fd7-7a65-46df-bd1b-15f2dfaaded7/download/acoes_e_programas_json_2021_20211231.json"),
      fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/55784447-97e8-4fb0-b062-99c368bf6384/download/acoes_e_programas_json_2022_20221231.json"),
      fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/421e1035-ef96-4ac9-99cc-07a34ab93444/download/acoes_e_programas_json_2023_20231230.json"),
      fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json"),
      fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/bd2f90f2-3cc1-4b46-ab8d-9b15a1b0d453/download/acoes_e_programas_json_2025_20250716.json"),
    ]);

    const totalValueBudgeted2020 = data2020.budgeted;
    const totalValueExecuted2020 = data2020.executed;
    const totalValueActions2020 = data2020.budgeted; // Assuming totalValueActions is the same as budgeted

    const totalValueBudgeted2021 = data2021.budgeted;
    const totalValueExecuted2021 = data2021.executed;
    const totalValueActions2021 = data2021.budgeted;

    const totalValueBudgeted2022 = data2022.budgeted;
    const totalValueExecuted2022 = data2022.executed;
    const totalValueActions2022 = data2022.budgeted;

    const totalValueBudgeted2023 = data2023.budgeted;
    const totalValueExecuted2023 = data2023.executed;
    const totalValueActions2023 = data2023.budgeted;

    const totalValueBudgeted2024 = data2024.budgeted;
    const totalValueExecuted2024 = data2024.executed;
    const totalValueActions2024 = data2024.budgeted;

    const totalValueBudgeted2025 = data2025.budgeted;
    const totalValueExecuted2025 = data2025.executed;
    const totalValueActions2025 = data2025.budgeted;

    // The `actions2023` for the table should still come from the 2025 data as per previous context.
    const response = await fetch("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/bd2f90f2-3cc1-4b46-ab8d-9b15a1b0d453/download/acoes_e_programas_json_2025_20250716.json");
    if (!response.ok) {
      throw new Response("Erro ao buscar os dados da tabela", { status: response.status });
    }
    const data = await response.json();
    const actions2023 = data.campos;

    // Mock data for cover, description, and totalValueEmissions
    const cover = { url: "" };
    const description = "";
    const totalValueEmissions = 0;

    return json({
      cover,
      description,
      totalValueBudgeted2020,
      totalValueBudgeted2021,
      totalValueBudgeted2022,
      totalValueBudgeted2023,
      totalValueBudgeted2024,
      totalValueBudgeted2025,
      totalValueExecuted2020,
      totalValueExecuted2021,
      totalValueExecuted2022,
      totalValueExecuted2023,
      totalValueExecuted2024,
      totalValueExecuted2025,
      totalValueActions2020,
      totalValueActions2021,
      totalValueActions2022,
      totalValueActions2023,
      totalValueActions2024,
      totalValueActions2025,
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
      totalValueBudgeted2024: 0,
      totalValueBudgeted2025: 0,
      totalValueExecuted2020: 0,
      totalValueExecuted2021: 0,
      totalValueExecuted2022: 0,
      totalValueExecuted2023: 0,
      totalValueExecuted2024: 0,
      totalValueExecuted2025: 0,
      totalValueActions2020: 0,
      totalValueActions2021: 0,
      totalValueActions2022: 0,
      totalValueActions2023: 0,
      totalValueActions2024: 0,
      totalValueActions2025: 0,
      totalValueEmissions: 0,
      actions2023: []
    });
  }
};