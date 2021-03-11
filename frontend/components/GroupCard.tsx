import React from "react";
import Link from "next/link";
import Image from "next/image";

const StatusIndicator = ({ status }) => {
  const statusMap = new Map([
    ["articular", { name: "Articulação Institucional", color: "#00A4AA", fontColor: "white" },],
    ["incidir", { name: "Incidência Política", color: "#008080", fontColor: "white" }],
    ["cultuar", { name: "Cultura da Bicicleta", color: "#E66762", fontColor: "white" }],
    ["fortalecer", { name: "Fortalecimento Institucional", color: "#003938", fontColor: "white" }],
  ]);
  return (
    <div
      className="uppercase p-4 rounded bg-green-400 font-semibold absolute text-sm"
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

export const GroupCard = ({ group }) => {
  return (
    <div className="bg-white rounded-lg shadow " style={{ minHeight: "450px" }}>
      <StatusIndicator status={group.directive} />
      {group.icon ? (
        <Link href={`${group.telegram_url}`}>
          <div
            style={{
              backgroundImage: `url(${group.icon.url})`,
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
          <Link href={`${group.telegram_url}`}>
            <dt className="mt-1 text-3xl font-semibold leading-9 text-gray-900 cursor-pointer">
              {group.name}
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
            {group.description}
          </dt>
          <dt>
            <div className="flex flex-wrap justify-center mt-6">
            <a href={group.telegram_url}>
                  <button
                    className="bg-ameciclo active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                  >
                    Grupo no Telegram
                  </button>
              </a>
              <a href={group.folder_url}>
                  <button
                    className="bg-ameciclo active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                  >
                    Pasta do Grupo
                  </button>
              </a>
              {group.Links.map((link) => {
                return (
                  <a href={link.link}>
                    <button
                      className="bg-ameciclo active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1"
                      type="button"
                      style={{ transition: "all .15s ease" }}
                    >
                      {link.title}
                    </button>
                  </a>
                );
              })}
            </div>
          </dt>
        </dl>
      </div>
    </div>
  );
};
