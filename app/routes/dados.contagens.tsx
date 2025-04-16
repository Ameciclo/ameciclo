import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

import { loader } from "~/loader/dados.contagem";
export { loader };

export default function Contagens() {
    const { cover } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={cover?.url} alt="Capa da página de contagens" />;
            <Breadcrumb label="Contagens" slug="/contagens" routes={["/", "/dados"]} />
        </>
    );
}