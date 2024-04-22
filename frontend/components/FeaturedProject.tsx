import React from "react";
import Link from "next/link";
import Image from "next/image";

export const FeaturedProject = ({ project }) => {
  return (
    <>
      <div className="flex min-h-[600px] relative">
        <div className="keen-slider__slide max-h-[600px]">
          <Image
            src={project.media.url}
            alt={project.name}
            layout="fill"
            objectFit="cover"
          />
          <div className="container flex justify-center h-full mx-auto my-auto">
            <div
              className="relative mx-auto my-auto rounded-lg shadow-xl bg-gray100Transparent max-h-[18rem] max-w-[850px]"
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
                    <span className="flex items-baseline mt-3 text-ameciclo hover:text-red-600 focus:text-red-600">
                      Conheça mais
                      <span className="ml-1 text-xs">&#x279c;</span>
                    </span>
                  </Link>ß
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
