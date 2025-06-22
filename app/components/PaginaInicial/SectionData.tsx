import Counter from "../Commom/Counter";

export default function SectionData({ projects }: any) {
    const validProjects = (projects || []).filter(
        (project: any) => !project.slug.endsWith("_es") && !project.slug.endsWith("_en")
    );

    const ongoingProjects = validProjects.filter(
        (project: any) => project.status === "ongoing"
    ).length;

    const totalProjects = validProjects.length;

    return (
        <section className="bg-ameciclo">
            <div className="container px-6 py-20 mx-auto">
                <div className="flex flex-wrap justify-around">
                    <Counter label={"Projetos em Andamento"} number={ongoingProjects} />
                    <Counter label={"Projetos Realizados"} number={totalProjects} />
                    <Counter label={"Pessoas Associadas"} number={1306} />
                </div>
            </div>
        </section>
    );
}