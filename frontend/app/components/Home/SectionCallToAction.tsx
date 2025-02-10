import { motion } from "framer-motion";
import { redirect } from "@remix-run/node";
import Apoie from "../Icons/apoie";
import Associe from "../Icons/associe";
import Participe from "../Icons/participe";
import { json, Link, useLoaderData } from "@remix-run/react";

export async function loader() {
    type HomeData = {
        participation_url: string;
        association_url: string;
        donate_url: string;
    };

    const response = await fetch(`https://cms.ameciclo.org/home`);
    if (response.status !== 200) {
        throw redirect("/404");
    }

    const home: HomeData = await response.json();

    return json({ home });
}

export default function SectionCallToAction() {
    try {
        const { home } = useLoaderData<typeof loader>();

        return (
            <section className="bg-ameciclo">
                <div className="container px-6 py-20 mx-auto">
                    <div className="flex flex-wrap justify-around">
                        <Link className="buttom-call-actions" to={home?.participation_url}><Participe /></Link>
                        <Link className="buttom-call-actions" to={home?.association_url}><Associe /></Link>
                        <Link className="buttom-call-actions" to={home?.donate_url}><Apoie /></Link>
                    </div>
                </div>
            </section>
        );
    } catch (err) {
        return (
            <section className="bg-ameciclo">
                <a href="/status">!</a>
                <div className="container px-6 py-20 mx-auto">
                    <div className="flex flex-wrap justify-around">
                        <Link className="buttom-call-actions" to="https://participe.ameciclo.org"><Participe /></Link>
                        <Link className="buttom-call-actions" to="https://queroser.ameciclo.org"><Associe /></Link>
                        <Link className="buttom-call-actions" to="https://apoia.se/ameciclo"><Apoie /></Link>
                    </div>
                </div>
            </section>
        );
    }
}
