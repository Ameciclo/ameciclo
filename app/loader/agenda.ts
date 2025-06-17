import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
        throw json(
            { message: "A chave da API do Google Calendar nao esta definida." },
            { status: 500 }
        );
    }
    const googleCalendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    return json({ googleCalendarApiKey });
};