import { MetaFunction } from "@remix-run/node";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { useEffect, useRef } from "react";
import { AgendaContent } from "~/components/Agenda/AgendaContent";
import { loader } from "../loader/agenda";
export { loader };

export const meta: MetaFunction = () => {
    return [{ title: "Agenda" }];
};
export default function Agenda() {
    const { calendarConfig, apiDown, apiErrors } = useLoaderData<typeof loader>();
    const { setApiDown, addApiError } = useApiStatus();
    const errorsProcessed = useRef(false);
    
    useEffect(() => {
        if (!errorsProcessed.current) {
            setApiDown(apiDown);
            if (apiErrors && apiErrors.length > 0) {
                apiErrors.forEach((error: {url: string, error: string}) => {
                    addApiError(error.url, error.error, '/agenda');
                });
            }
            errorsProcessed.current = true;
        }
    }, [apiDown, apiErrors, setApiDown, addApiError]);

    return (
        <>
            <Banner image={bannerSchedule} alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe" />
            <Breadcrumb label="Agenda" slug="/agenda" routes={["/"]} />
            <ApiStatusHandler apiDown={apiDown} />
            <AgendaContent calendarConfig={calendarConfig} />
        </>
    );
}
