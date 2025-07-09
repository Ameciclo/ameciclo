import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import EventCalendar from "~/components/Agenda/EventCalendar";
import { useLoaderData, useRouteError } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import { loader } from "~/loader/agenda";
export { loader };
export const meta: MetaFunction = () => {
    return [{ title: "Agenda" }];
};

export default function Agenda() {
    const { googleCalendarApiKey, externalCalendarId, internalCalendarId } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={bannerSchedule} alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe" />
            <Breadcrumb label="Agenda" slug="/agenda" routes={["/"]} />
            <div className="container px-4 py-4 mx-auto my-10">
                <div className="px-4 py-4 rounded border border-gray-300">
                    <EventCalendar 
                        googleCalendarApiKey={googleCalendarApiKey}
                        externalCalendarId={externalCalendarId}
                        internalCalendarId={internalCalendarId}
                    />
                </div>
            </div>
        </>
    );
}
