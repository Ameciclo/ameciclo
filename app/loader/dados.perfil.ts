import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    try {
        const res = await fetch("https://cms.ameciclo.org/perfil", {
            cache: "no-cache",
        });

        const data = await res.json();
        const { cover, description, objective } = data;
        
        return json({ 
            cover,
            description,
            objective,
        });
    } catch (error) {
        console.error("Erro no loader:", error);
        throw json({ message: "Strapi error - Erro ao buscar os dados" }, { status: 500 });
    }
};