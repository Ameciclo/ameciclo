import { motion } from "framer-motion";
import { redirect } from "@remix-run/node";
import Apoie from "../Icons/apoie";
import Associe from "../Icons/associe";
import Participe from "../Icons/participe";
import { useLoaderData } from "@remix-run/react";

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

    const home: HomeData = await response.json()

    return {
        home,
    };
}

export default function SectionCallToAction() {

    const { home } = useLoaderData<typeof loader>();

    return (
        <section className="bg-ameciclo">
            <div className="container px-6 py-20 mx-auto">
                <div className="flex flex-wrap justify-around">
                    {/* Botão "Participe" */}
                    <div className="p-4 text-center">
                        <a href={home.participation_url}>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Participe />
                            </motion.div>
                        </a>
                    </div>

                    {/* Botão "Associe-se" */}
                    <div className="p-4 text-center">
                        <a href={home.association_url}>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Associe />
                            </motion.div>
                        </a>
                    </div>

                    {/* Botão "Apoie" */}
                    <div className="p-4 text-center">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={home.donate_url}
                        >
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Apoie />
                            </motion.div>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
