import React from "react";
import Link from "next/link";
import Image from "next/image";

export const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow " style={{ minHeight: "450px" }}>
      {product.media ? (
        <Link href={`${product.url}`}>
          <div
            style={{
              backgroundImage: `url(${product.media.url})`,
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
        <div
          style={{
            minHeight: "270px",
          }}
        />
      )}
      <div className="px-4 py-5 lg:p-6">
        <dl className="pb-6">
          <Link href={`${product.url}`}>
            <dt className="mt-1 text-2xl font-semibold text-gray-900 cursor-pointer">
              {product.title}
            </dt>
          </Link>
          <dt
            className="text-sm text-gray-600"
            style={{
              //maxHeight: "100px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.desc}
          </dt>
          <dt>
            <div className="flex flex-wrap justify-center mt-6">
            <a href={product.url}>
                  <button
                    className="bg-ameciclo active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xl px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                  >
                    R$ {(product.value + "").replace(".",",")}
                  </button>
              </a>
            </div>
          </dt>
        </dl>
      </div>
    </div>
  );
};
