import { queryOptions } from "@tanstack/react-query";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { IDECICLO_DATA, IDECICLO_STRUCTURES_DATA, IDECICLO_PAGE_DATA } from "~/servers";

export const idecicloQueryOptions = () =>
  queryOptions({
    queryKey: ["dados", "ideciclo"],
    queryFn: async () => {
      const errors: Array<{url: string, error: string}> = [];

      const onError = (url: string) => (error: string) => {
          errors.push({ url, error });
      };

      const [idecicloData, structuresData, pageDataResponse] = await Promise.all([
          fetchWithTimeout(
              IDECICLO_DATA,
              { cache: "no-cache" },
              30000,
              [],
              onError(IDECICLO_DATA)
          ),
          fetchWithTimeout(
              IDECICLO_STRUCTURES_DATA,
              { cache: "no-cache" },
              30000,
              [],
              onError(IDECICLO_STRUCTURES_DATA)
          ),
          fetchWithTimeout(
              IDECICLO_PAGE_DATA,
              { cache: "no-cache" },
              30000,
              null,
              onError(IDECICLO_PAGE_DATA)
          )
      ]);

      const pageData = pageDataResponse?.data || { description: "", objective: "", methodology: "", cover: null };

      return {
          ideciclo: idecicloData,
          structures: structuresData,
          pageData,
          apiDown: errors.length > 0,
          apiErrors: errors
      };
    },
  });

// Keep for backwards compatibility
export const loader = async () => idecicloQueryOptions().queryFn({} as any);
