import { queryOptions } from "@tanstack/react-query";
import { fetchWithServerAlert } from "~/services/apiWithAlert.server";
import { PLATAFORM_HOME_PAGE } from "~/servers";

export const dadosExampleQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "example"],
    queryFn: async () => {
      try {
        const { data, apiDown } = await fetchWithServerAlert(
          PLATAFORM_HOME_PAGE,
          { cache: "no-cache" },
          10000,
          { cover: null, description: null, partners: [] }
        );

        const { cover, description, partners } = data || {};
        return {
          cover,
          description,
          partners,
          apiDown,
        };
      } catch (error) {
        console.error("Erro no loader:", error);
        return {
          cover: null,
          description: null,
          partners: [],
          apiDown: true,
        };
      }
    },
  });

export const loader = async () =>
  dadosExampleQueryOptions().queryFn({} as any);
