import React from "react";
import Link from "next/link";

export const FeaturedProducts = ({ project: product }) => {
  return (
    <>
      <div
        className="bg-transparent w-full bg-cover bg-no-repeat flex"
        style={
          product.media
            ? {
                backgroundImage: `url(${product.media.url})`,
                minHeight: "600px",
              }
            : {
                backgroundColor: "#fff",
                minHeight: "600px",
              }
        }
      >
        <div className="mx-auto my-auto container h-full flex justify-center">
          <div
            className="relative rounded-lg block bg-gray100Transparent shadow-xl"
            style={{
              minHeight: "18rem",
              maxWidth: "850px",
            }}
            key={product.id}
          >
            <div className="flex items-center justify-center text-gray-800 mt-5">
              <h1 className="lg:text-6xl text-3xl">{product.name}</h1>
            </div>
            <div className="mt-5 border-t border-gray-600 text-center">
              <div className="p-6 md:pr-24 md:pl-16 md:py-6">
                <p
                  className="text-gray-800 text-xl"
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {product.description}
                </p>
                <Link href={`${product.url}`}>
                  <a className="flex items-baseline mt-3 text-ameciclo hover:text-red-600 focus:text-red-600">
                    <span>Vamos nessa!</span>
                    <span className="text-xs ml-1">&#x279c;</span>
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
