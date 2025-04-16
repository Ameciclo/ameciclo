import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

import { loader } from "~/loader/dados.observatorio";
export { loader };

export default function Observatorio() {
    const { cover } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página do Observatório" />
            <Breadcrumb label="Observatório" slug="/dados/observatorio" routes={["/", "/dados"]} />
        </>
    );
}