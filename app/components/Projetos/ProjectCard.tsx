import { Link } from "@remix-run/react";

const StatusIndicator = ({ status }: any) => {
    const statusMap = new Map([
        ["ongoing", { name: "Em andamento", color: "#008080", fontColor: "white" }],
        ["paused", { name: "Pausado", color: "#F48A42", fontColor: "white" }],
        ["finished", { name: "Realizado", color: "#00A870", fontColor: "white" }],
    ]);

    return (
        <div
            className="p-4 font-semibold uppercase bg-green-400 rounded"
            style={{
                maxHeight: "50px",
                color: statusMap.get(status)?.fontColor,
                backgroundColor: statusMap.get(status)?.color,
                borderRadius: "0 0 15px 0",
                borderBottom: "0 none",
                boxShadow: "0 1px 5px rgba(0, 0, 0, 0.46)",
                zIndex: 1,
                position: "relative",
            }}
        >
            {statusMap.get(status)?.name}
        </div>
    );
};

export const ProjectCard = ({ project, translations }: any) => {
    const translationLinks = [];

    if (translations["es"]) {
        translationLinks.push(
            <Link to={`/projetos/${translations["es"].slug}`} key="es">
                <a className="flex items-center mx-2 text-lg">
                    <span role="img" aria-label="Espanhol" className="mr-1">
                        🇪🇸
                    </span>
                    <span>Traducción</span>
                </a>
            </Link>
        );
    }

    if (translations["en"]) {
        translationLinks.push(
            <Link to={`/projetos/${translations["en"].slug}`} key="en" >
                <a className="flex items-center mx-2 text-lg">
                    <span role="img" aria-label="Inglês" className="mr-1">
                        🇬🇧
                    </span>
                    <span>Translation</span>
                </a>
            </Link>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow relative" style={{ minHeight: "450px" }}>
            <div className="absolute top-0 left-0">
                <StatusIndicator status={project.status} />
            </div>
            {project.media ? (
                <Link to={`/projetos/${project.slug}`}>
                    <div
                        style={{
                            backgroundImage: `url(${project.media.url})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            position: "relative",
                            minHeight: "270px",
                            cursor: "pointer",
                        }}
                    />
                </Link>
            ) : (
                <div style={{ minHeight: "270px" }} />
            )}
            <div className="px-4 py-5 lg:p-6">
                <dl className="pb-6">
                    <Link to={`/projetos/${project.slug}`}>
                        <dt className="mt-1 text-3xl font-semibold leading-9 text-gray-900 cursor-pointer">
                            {project.name}
                        </dt>
                    </Link>
                    <dt
                        className="text-sm text-gray-600"
                        style={{
                            maxHeight: "80px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {project.description}
                    </dt>
                </dl>
                {translationLinks.length > 0 && (
                    <div className="mt-4 flex items-center">
                        {translationLinks}
                    </div>
                )}
            </div>
        </div>
    );
};
