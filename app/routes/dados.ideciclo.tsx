import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

import { loader } from "~/loader/dados.ideciclo";
export { loader };

export default function Ideciclo() {
    const { cover } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página do Ideciclo" />
            <Breadcrumb label="Ideciclo" slug="/dados/ideciclo" routes={["/", "/dados"]} />
        </>
    );
}