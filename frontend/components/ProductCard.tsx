import React from "react";
import Link from "next/link";
import Image from "next/image";

const StatusIndicator = ({ status }) => {
  const statusMap = new Map([
    [
      "ongoing",
      { name: "Em andamento", color: "#008080", fontColor: "white" },
    ],
    ["paused", { name: "Pausado", color: "#F48A42", fontColor: "white" }],
    ["finished", { name: "Realizado", color: "#00A870", fontColor: "white" }],
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
        zIndex: 1,
      }}
    >
      {statusMap.get(status).name}
    </div>
  );
};

export const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow " style={{ minHeight: "450px" }}>
      <StatusIndicator status={product.status} />
      {product.media ? (
        <Link href={`/projetos/${product.slug}`}>
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
          <Link href={`/projetos/${product.slug}`}>
            <dt className="mt-1 text-3xl font-semibold leading-9 text-gray-900 cursor-pointer">
              {product.name}
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
            {product.description}
          </dt>
        </dl>
      </div>
    </div>
  );
};
