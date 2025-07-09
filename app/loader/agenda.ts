import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    const googleCalendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    const externalCalendarId = process.env.GOOGLE_CALENDAR_EXTERNAL_ID;
    const internalCalendarId = process.env.GOOGLE_CALENDAR_INTERNAL_ID;
    
    return json({ 
        googleCalendarApiKey,
        externalCalendarId,
        internalCalendarId
    });
};