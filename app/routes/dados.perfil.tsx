import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

import { loader } from "~/loader/dados.perfil";
export { loader };

export default function perfil() {
    const { cover } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de Perfil do Ciclista" />
            <Breadcrumb label="perfil" slug="/perfil" routes={["/", "/dados"]} />
        </>
    );
}