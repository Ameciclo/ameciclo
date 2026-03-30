import { queryOptions } from "@tanstack/react-query";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { AMECICLISTAS_DATA, QUEM_SOMOS_DATA } from "~/servers";

export const quemSomosQueryOptions = () =>
  queryOptions({
    queryKey: ["quemsomos"],
    queryFn: async () => {
      const errors: Array<{ url: string; error: string }> = [];

      const onError = (url: string) => (error: string) => {
        errors.push({ url, error });
      };

      const [ameciclistas, custom] = await Promise.all([
        fetchWithTimeout(
          AMECICLISTAS_DATA,
          { cache: "no-cache" },
          15000,
          null,
          onError(AMECICLISTAS_DATA)
        ),
        fetchWithTimeout(
          QUEM_SOMOS_DATA,
          { cache: "no-cache" },
          15000,
          null,
          onError(QUEM_SOMOS_DATA)
        ),
      ]);

      let processedAmeciclistas = [];
      let ameciclistasLoading = true;

      if (ameciclistas && Array.isArray(ameciclistas["data"])) {
        processedAmeciclistas = ameciclistas["data"].sort(
          (a: any, b: any) => a.name.localeCompare(b.name)
        );
        ameciclistasLoading = false;
      }

      let processedCustom = { definition: "", objective: "", links: [] };
      let customLoading = true;

      if (custom && custom["data"]) {
        processedCustom = custom["data"];
        customLoading = false;
      }

      return {
        pageData: {
          ameciclistas: processedAmeciclistas,
          custom: processedCustom,
          ameciclistasLoading,
          customLoading,
        },
        apiErrors: errors,
      };
    },
  });

export const loader = async () =>
  quemSomosQueryOptions().queryFn({} as any);
