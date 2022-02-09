import React from "react";
import Link from "next/link";
import Image from "next/image";

export const FeaturedProject = ({ project }) => {
  return (
    <>
      <div className="flex min-h-[600px] relative">
        <Image
          src={project.media.url}
          alt={project.name}
          layout="fill"
          objectFit="cover"
        />
        <div className="container flex justify-center h-full mx-auto my-auto">
          <div
            className="relative block rounded-lg shadow-xl bg-gray100Transparent min-h-[18rem] max-w-[850px]"
            key={project.id}
          >
            <div className="flex items-center justify-center mt-5 text-gray-800">
              <h1 className="text-3xl lg:text-6xl">{project.name}</h1>
            </div>
            <div className="mt-5 text-center border-t border-gray-600">
              <div className="p-6 md:pr-24 md:pl-16 md:py-6">
                <p
                  className="text-xl text-gray-800"
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {project.description}
                </p>
                <Link href={`/projetos/${project.slug}`}>
                  <a className="flex items-baseline mt-3 text-ameciclo hover:text-red-600 focus:text-red-600">
                    <span>Conheça mais</span>
                    <span className="ml-1 text-xs">&#x279c;</span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
