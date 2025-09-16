import { defer, MetaFunction } from "@remix-run/node";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import EventCalendar from "~/components/Agenda/EventCalendar";
import AgendaLoading from "~/components/Agenda/AgendaLoading";
import { useLoaderData, Await } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import { Suspense } from "react";
import { loader } from "../loader/agenda";
export { loader };

export const meta: MetaFunction = () => {
    return [{ title: "Agenda" }];
};

function AgendaContent({ calendarConfig }: { calendarConfig: any }) {
    const { googleCalendarApiKey, externalCalendarId, internalCalendarId } = calendarConfig;

    if (!googleCalendarApiKey) {
        return (
            <div className="container px-4 py-4 mx-auto my-10">
                <div className="px-4 py-4 rounded border border-gray-300">
                    <div className="text-center py-12">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">
                                Configuração da agenda indisponível
                            </h3>
                            <p className="text-yellow-600 mb-4">
                                A chave da API do Google Calendar não está definida.
                            </p>
                            <a
                                href="/contato"
                                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                            >
                                Reportar problema
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-4 py-4 mx-auto my-10">
            <div className="px-4 py-4 rounded border border-gray-300">
                <EventCalendar
                    googleCalendarApiKey={googleCalendarApiKey}
                    externalCalendarId={externalCalendarId}
                    internalCalendarId={internalCalendarId}
                />
            </div>
        </div>
    );
}



export default function Agenda() {
    const { calendarConfig } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={bannerSchedule} alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe" />
            <Breadcrumb label="Agenda" slug="/agenda" routes={["/"]} />
            <Suspense fallback={<AgendaLoading />}>
                <Await resolve={calendarConfig}>
                    {(data) => <AgendaContent calendarConfig={data} />}
                </Await>
            </Suspense>
        </>
    );
}
