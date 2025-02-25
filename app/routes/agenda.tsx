import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import EventCalendar from "~/components/Agenda/EventCalendar";
import { useLoaderData } from "@remix-run/react";
// 🔹 SEO Metadata no Remix
export const meta: MetaFunction = () => {
    return [{ title: "Agenda" }];
};

// 🔹 Loader para carregar a chave da API no servidor
export const loader: LoaderFunction = async () => {
    const googleCalendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    if (!googleCalendarApiKey) {
        throw new Error("A chave da API do Google Calendar não está definida.");
    }

    return json({ googleCalendarApiKey });
};


export default function Agenda() {
    const { googleCalendarApiKey } = useLoaderData<typeof loader>();

    return (
        <>
            <div className="relative w-full h-[52vh]">
                <img
                    src="/agenda.webp"
                    alt="Agenda"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
                <div className="container mx-auto">
                    <Breadcrumb label="Agenda" slug="/agenda" routes={["/", "/agenda"]} />
                </div>
            </div>

            <div className="container px-4 py-4 mx-auto my-10">
                <div className="px-4 py-4 rounded border border-gray-300">
                    <EventCalendar googleCalendarApiKey={googleCalendarApiKey} />
                </div>
            </div>
        </>
    );
}
