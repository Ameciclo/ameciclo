import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    const idecicloRes = await fetch("https://api.ideciclo.ameciclo.org/reviews", { cache: "no-cache" });
    const ideciclo = await idecicloRes.json();
  
    const structuresRes = await fetch("https://api.ideciclo.ameciclo.org/structures", {
      cache: "no-cache",
    });
    const structures = await structuresRes.json();
  
    const pageDataRes = await fetch("https://cms.ameciclo.org/ideciclo", { cache: "no-cache" });
    const pageData = await pageDataRes.json();
  
    return json({ ideciclo, structures, pageData });
};
