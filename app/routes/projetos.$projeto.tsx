import { useParams } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";

export default function Projeto() {
    const { projeto } = useParams();
    return (
        <>
            <Banner />
            <Breadcrumb label={projeto} slug={`/${projeto}`} routes={["/", "/projetos"]} />
        </>
    );
}