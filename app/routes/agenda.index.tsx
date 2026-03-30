import { createFileRoute } from "@tanstack/react-router";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { useEffect, useRef } from "react";
import { AgendaContent } from "~/components/Agenda/AgendaContent";
import { useSuspenseQuery } from "@tanstack/react-query";
import { agendaQueryOptions } from "../loader/agenda";

export const Route = createFileRoute("/agenda/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(agendaQueryOptions()),
  head: () => ({
    meta: [{ title: "Agenda" }],
  }),
  component: Agenda,
});

function Agenda() {
    const { data: { calendarConfig, apiDown, apiErrors } } = useSuspenseQuery(agendaQueryOptions());
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
