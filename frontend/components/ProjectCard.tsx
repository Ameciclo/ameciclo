import React from "react";
import Link from "next/link";

const StatusIndicator = ({ status }) => {
  const statusMap = new Map([
    [
      "ongoing",
      { name: "Em andamento", color: "#6CAF56", fontColor: "#dbf4c6" },
    ],
    ["paused", { name: "Pausado", color: "#E8E288", fontColor: "#615f46" }],
    [
      "finished",
      { name: "Finalizado", color: "#FF8360", fontColor: "#581f0f" },
    ],
  ]);
  return (
    <div
      className="uppercase p-4 rounded bg-green-400 font-semibold absolute"
      style={{
        maxHeight: "50px",
        color: statusMap.get(status).fontColor,
        backgroundColor: statusMap.get(status).color,
        borderRadius: "0 0 15px 0",
        borderBottom: "0 none",
        boxShadow: "0 1px 5px rgba(0, 0, 0, 0.46)",
      }}
    >
      {statusMap.get(status).name}
    </div>
  );
};

export const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow " style={{ minHeight: "450px" }}>
      <StatusIndicator status={project.status} />
      {project.media ? (
        <Link href={`/projetos/${project.slug}`}>
          <div
            style={{
              backgroundImage: `url(https://cms.ameciclo.org${project.media.url})`,
              minHeight: "270px",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              cursor: "pointer",
            }}
          />
        </Link>
      ) : (
        <div
          style={{
            minHeight: "270px",
          }}
        />
      )}
      <div className="px-4 py-5 lg:p-6">
        <dl className="pb-6">
          <Link href={`/projetos/${project.slug}`}>
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
      </div>
    </div>
  );
};
