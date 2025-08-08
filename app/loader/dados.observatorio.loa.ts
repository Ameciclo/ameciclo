import { json, defer, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const fetchYearlyData = async (url: string, timeout = 5000) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AmecicloBot/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
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
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${url}`);
      } else {
        console.error(`Error processing data from ${url}:`, error);
      }
      return { budgeted: 0, executed: 0 };
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch data with shorter timeout and better error handling
      const dataPromises = [
        fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/5e5e1107-e1ed-4c2c-b258-e19a013f6caa/download/acoes_e_programas_json_2020_20201231.json"),
        fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/0a2e8fd7-7a65-46df-bd1b-15f2dfaaded7/download/acoes_e_programas_json_2021_20211231.json"),
        fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/55784447-97e8-4fb0-b062-99c368bf6384/download/acoes_e_programas_json_2022_20221231.json"),
        fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/421e1035-ef96-4ac9-99cc-07a34ab93444/download/acoes_e_programas_json_2023_20231230.json"),
        fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/6d2fff01-6bb7-43c2-baea-c82a5cdfb206/download/acoes_e_programas_json_2024_20241213.json"),
        fetchYearlyData("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/bd2f90f2-3cc1-4b46-ab8d-9b15a1b0d453/download/acoes_e_programas_json_2025_20250716.json")
      ];

      const [data2020, data2021, data2022, data2023, data2024, data2025] = await Promise.allSettled(dataPromises);
      
      // Extract data from settled promises
      const getData = (result: any) => result.status === 'fulfilled' ? result.value : { budgeted: 0, executed: 0 };
      
      const yearData = {
        2020: getData(data2020),
        2021: getData(data2021),
        2022: getData(data2022),
        2023: getData(data2023),
        2024: getData(data2024),
        2025: getData(data2025)
      };

      // Fetch table data separately with timeout
      let actions2023 = [];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch("https://dados.pe.gov.br/dataset/38401a88-5a99-4b21-99d2-2d4a36a241f1/resource/421e1035-ef96-4ac9-99cc-07a34ab93444/download/acoes_e_programas_json_2023_20231230.json", {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AmecicloBot/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          actions2023 = data.campos || [];
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }

      return {
        totalValueBudgeted2020: yearData[2020].budgeted,
        totalValueExecuted2020: yearData[2020].executed,
        totalValueActions2020: yearData[2020].budgeted,
        totalValueBudgeted2021: yearData[2021].budgeted,
        totalValueExecuted2021: yearData[2021].executed,
        totalValueActions2021: yearData[2021].budgeted,
        totalValueBudgeted2022: yearData[2022].budgeted,
        totalValueExecuted2022: yearData[2022].executed,
        totalValueActions2022: yearData[2022].budgeted,
        totalValueBudgeted2023: yearData[2023].budgeted,
        totalValueExecuted2023: yearData[2023].executed,
        totalValueActions2023: yearData[2023].budgeted,
        totalValueBudgeted2024: yearData[2024].budgeted,
        totalValueExecuted2024: yearData[2024].executed,
        totalValueActions2024: yearData[2024].budgeted,
        totalValueBudgeted2025: yearData[2025].budgeted,
        totalValueExecuted2025: yearData[2025].executed,
        totalValueActions2025: yearData[2025].budgeted,
        actions2023
      };
    } catch (error) {
      console.error("Error loading data:", error);
      return {
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
        actions2023: []
      };
    }
  };

  // Return immediately with basic data and defer heavy API calls
  return defer({
    cover: { url: "" },
    description: "",
    totalValueEmissions: 0,
    dataPromise: fetchAllData()
  });
};