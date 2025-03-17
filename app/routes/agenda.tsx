import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import EventCalendar from "~/components/Agenda/EventCalendar";
import { useLoaderData } from "@remix-run/react";
import Banner from "~/components/Commom/Banner";
import bannerSchedule from "/agenda.webp";
import ErrorFallback from "~/components/Commom/ErrorFallback";
// 🔹 SEO Metadata no Remix
export const meta: MetaFunction = () => {
    return [{ title: "Agenda" }];
};

// 🔹 Loader para carregar a chave da API no servidor
export const loader: LoaderFunction = async () => {
    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
        throw json(
            { message: "A chave da API do Google Calendar não está definida." },
            { status: 500 }
        );
    }
    const googleCalendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    return json({ googleCalendarApiKey });
};


export default function Agenda() {
    const { googleCalendarApiKey } = useLoaderData<typeof loader>();

    return (
        <>
            <Banner image={bannerSchedule} alt="Várias pessoas associadas ameciclo segurando uma faixa que diz Dia Mundial Sem Carro em cima de um barco no rio capibaribe" />
            <Breadcrumb label="Agenda" slug="/agenda" routes={["/", "/agenda"]} />
            <div className="container px-4 py-4 mx-auto my-10">
                <div className="px-4 py-4 rounded border border-gray-300">
                    <EventCalendar googleCalendarApiKey={googleCalendarApiKey} />
                </div>
            </div>
        </>
    );
}

export function ErrorBoundary() {
    return <ErrorFallback />;
  }