import { useLoaderData } from "@remix-run/react";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useEffect } from "react";
import Banner from "~/components/Commom/Banner";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { ExplanationBoxesIdeciclo } from "~/components/Ideciclo/ExplanationBoxesIdeciclo";
import IdecicloClientSide from "~/components/Ideciclo/IdecicloClientSide";
import { StatisticsBoxIdeciclo } from "~/components/Ideciclo/StatisticsBoxIdeciclo";
import { calculateIdecicloStatistics } from "~/services/ideciclo-statistics.service";
import { loader } from "~/loader/dados.ideciclo";

export { loader };


export default function Ideciclo() {
    const { ideciclo, structures, pageData, apiDown, apiErrors } = useLoaderData<typeof loader>();
    const { setApiDown, addApiError } = useApiStatus();
    
    useEffect(() => {
        setApiDown(apiDown);
        if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error: {url: string, error: string}) => {
                addApiError(error.url, error.error, '/dados/ideciclo');
            });
        }
    }, []);

    const coverImage = pageData?.cover?.url || "/pages_covers/ideciclo-cover.png";
    const cidades = (ideciclo || []).filter((c: any) => c.reviews?.length > 0);
    const statistics = calculateIdecicloStatistics(cidades, structures || []);

    return (
        <>
            <Banner title="" image={coverImage} />
            <Breadcrumb label="Ideciclo" slug="/dados/ideciclo" routes={["/", "/dados"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <StatisticsBoxIdeciclo title={"Estatísticas Gerais"} boxes={statistics} />
            <ExplanationBoxesIdeciclo
                boxes={[
                    { title: "O que é?", description: pageData?.description || "" },
                    { title: "Para que serve?", description: pageData?.objective || "" },
                    { title: "Metodologia", description: pageData?.methodology || "" },
                ]}
            />
            <IdecicloClientSide
                cidades={cidades}
                structures={structures || []}
                ideciclo={ideciclo || []}
            />
        </>
    );
}