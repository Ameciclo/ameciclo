import Counter from "../Commom/Counter";
import { Link } from "@remix-run/react";

export default function SectionData({ projects, apiDown }: any) {
    const validProjects = Array.isArray(projects) ? projects.filter(
        (project: any) => !project.slug.endsWith("_es") && !project.slug.endsWith("_en")
    ) : [];

    const ongoingProjects = validProjects.filter(
        (project: any) => project.status === "ongoing"
    ).length;

    const totalProjects = validProjects.length;

    return (
        <section className="bg-ameciclo">
            <div className="container px-6 py-20 mx-auto">
                <div className="flex flex-wrap justify-around">
                    <Link to="/projetos" className="transform hover:scale-105 transition-transform duration-200">
                        <Counter label={"Projetos em Andamento"} number={apiDown ? null : ongoingProjects} />
                    </Link>
                    <Link to="/projetos" className="transform hover:scale-105 transition-transform duration-200">
                        <Counter label={"Projetos Realizados"} number={apiDown ? null : totalProjects} />
                    </Link>
                    <a href="https://queroser.ameciclo.org" target="_blank" rel="noopener noreferrer" className="transform hover:scale-105 transition-transform duration-200">
                        <Counter label={"Pessoas Associadas"} number={1306} />
                    </a>
                </div>
            </div>
        </section>
    );
}