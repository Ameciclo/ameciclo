import React, { useState } from "react";
import ReactMapGl, { NavigationControl, Popup } from "react-map-gl";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";

const Contato = (props) => {
  const [viewport, setViewPort] = useState({
    latitude: -8.0592989,
    longitude: -34.8801119,
    zoom: 15,
    width: "100%",
    height: "400px",
  });
  return (
    <Layout>
      <SEO title="Contato" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "40vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/contato.png')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Contato"
            slug="/contato"
            routes={["/", "/contato"]}
          />
        </div>
      </div>
      <section className="container my-12 mx-auto">
        <div className="mt-5 mx-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="overflow-hidden bg-ameciclo rounded-lg shadow">
            <div className="px-4 py-5 lg:p-6 flex flex-col items-center text-center">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://participe.ameciclo.org"
                >
                  <svg
                    className="w-32 h-32 mb-4 text-ameciclo"
                    fill="currentColor"
                    viewBox="0 0 221 222"
                  >
                    <defs />
                    <path
                      fill="#fff"
                      d="M195 134c-7 24 22 13 9 35-14 21-17-10-36 7-18 17 12 24-11 35s-9-17-34-13-3 26-28 23 2-19-22-29c-23-10-16 20-36 4-19-16 12-15-2-36s-25 8-33-16c-7-24 18-7 18-32-1-25-25-6-19-31 7-24 18 4 32-17 13-22-18-19 1-36s13 13 36 2S66 4 90 0c25-4 4 19 29 22 26 3 11-24 34-14s-7 18 13 34c19 16 21-15 35 6s-15 11-7 35c7 24 25 0 26 25s-19 1-25 26z"
                    />
                    <path d="M64 72a643 643 0 01-12 36l7 3c9 3 13 6 12 9-2 4 1 10 7 11l3 3 4 2 4 3c1 3 4 5 7 5l2 1c1 2 6 4 9 4l6-3 5-3 4-2 5-2 6-4c2-2 3-3 5-3 3 0 5-3 5-6 0-2 1-4 5-8l6-4 7-3 7-4-2-3-16-31c-1-1-14 6-15 8s-5 1-9-1c-6-4-11-5-18-3-3 1-4 2-6 1-3-1-8 0-12 2-6 3-12 3-11-1 1-1 0-2-14-7h-1zm7 7l3 1-5 14c-6 15-5 14-10 12l-2-1 5-14 5-14 4 2zm84 13l8 13-4 2-3 2-5-8-8-14-3-5 4-2 3-2 8 14zm-31-9c4 2 5 3 9 3 5 0 4-1 13 15l4 9-4 5-5 5-10-9-15-15-6-5-2 2c-6 6-17 9-21 5-2-2-2-2-1-3 0-1 2-3 4-3 6-2 8-4 13-7 8-6 13-7 21-2zm-24-1l-11 6c-12 4-9 16 4 16 4 0 6-1 10-3l6-3c2-1 2-1 16 12l14 14c1 2 0 4-2 4l-8-6-7-6c-3 0-2 3 4 8l5 6-2 3-3 2-6-6c-6-6-9-7-9-5-1 1 1 3 4 7 5 4 6 5 5 6-2 2-3 2-3 0l-3-5-5-6c0-2-2-3-4-3l-3-2-2-3c-3-3-7-3-10 0l-2 2-3-2c-2-3-3-3-6-3-4 0-5 0-8-3l-3-3 5-12 4-12 6 1 7-1c6-4 9-5 10-3zm-18 38l1 2v3c-2 2-6 2-7 0-2-1-2-2-1-4 2-2 5-3 7-1zm15 1c1 1 1 1-5 8-3 4-5 5-7 3-1-1 0-3 5-9 4-3 6-4 7-2zm8 6c2 2 2 2 1 4l-4 5c-3 3-4 3-6 3-5 0-5-2 1-9 4-4 5-5 8-3zm7 8c2 2 2 4-1 6-3 4-5 4-7 3l-2-1 8-9 2 1z" />
                  </svg>
                </a>
              </motion.div>
              <dl>
                <dt className="text-2xl font-bold leading-5 text-white truncate mb-4 uppercase">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://participe.ameciclo.org"
                  >
                    Participe
                  </a>
                </dt>
                <dd className="mt-1 text-sm text-white">
                  <strong>Escolha a melhor forma de participar!</strong> <br />
                  Existem várias maneiras de ajudar a Ameciclo, cada pessoa pode
                  se envolver de um jeito.
                </dd>
              </dl>
            </div>
          </div>
          <div className="overflow-hidden bg-ameciclo rounded-lg shadow">
            <div className="px-4 py-5 lg:p-6 flex flex-col items-center text-center">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform"
                >
                  <svg
                    className="w-32 h-32 mb-4 text-ameciclo"
                    fill="currentColor"
                    viewBox="0 0 221 222"
                  >
                    <path
                      fill="#fff"
                      d="M195 134c-7 24 22 13 9 35-14 21-17-10-36 7-18 17 12 24-11 35s-9-17-34-13-3 26-28 23 2-19-22-29c-23-10-16 20-36 4-19-16 12-15-2-36s-25 8-33-16c-7-24 18-7 18-32-1-25-25-6-19-31 7-24 18 4 32-17 13-22-18-19 1-36s13 13 36 2S66 4 90 0c25-4 4 19 29 22 26 3 11-24 34-14s-7 18 13 34c19 16 21-15 35 6s-15 11-7 35c7 24 25 0 26 25s-19 1-25 26z"
                    />
                    <path d="M64 72a643 643 0 01-12 36l7 3c9 3 13 6 12 9-2 4 1 10 7 11l3 3 4 2 4 3c1 3 4 5 7 5l2 1c1 2 6 4 9 4l6-3 5-3 4-2 5-2 6-4c2-2 3-3 5-3 3 0 5-3 5-6 0-2 1-4 5-8l6-4 7-3 7-4-2-3-16-31c-1-1-14 6-15 8s-5 1-9-1c-6-4-11-5-18-3-3 1-4 2-6 1-3-1-8 0-12 2-6 3-12 3-11-1 1-1 0-2-14-7h-1zm7 7l3 1-5 14c-6 15-5 14-10 12l-2-1 5-14 5-14 4 2zm84 13l8 13-4 2-3 2-5-8-8-14-3-5 4-2 3-2 8 14zm-31-9c4 2 5 3 9 3 5 0 4-1 13 15l4 9-4 5-5 5-10-9-15-15-6-5-2 2c-6 6-17 9-21 5-2-2-2-2-1-3 0-1 2-3 4-3 6-2 8-4 13-7 8-6 13-7 21-2zm-24-1l-11 6c-12 4-9 16 4 16 4 0 6-1 10-3l6-3c2-1 2-1 16 12l14 14c1 2 0 4-2 4l-8-6-7-6c-3 0-2 3 4 8l5 6-2 3-3 2-6-6c-6-6-9-7-9-5-1 1 1 3 4 7 5 4 6 5 5 6-2 2-3 2-3 0l-3-5-5-6c0-2-2-3-4-3l-3-2-2-3c-3-3-7-3-10 0l-2 2-3-2c-2-3-3-3-6-3-4 0-5 0-8-3l-3-3 5-12 4-12 6 1 7-1c6-4 9-5 10-3zm-18 38l1 2v3c-2 2-6 2-7 0-2-1-2-2-1-4 2-2 5-3 7-1zm15 1c1 1 1 1-5 8-3 4-5 5-7 3-1-1 0-3 5-9 4-3 6-4 7-2zm8 6c2 2 2 2 1 4l-4 5c-3 3-4 3-6 3-5 0-5-2 1-9 4-4 5-5 8-3zm7 8c2 2 2 4-1 6-3 4-5 4-7 3l-2-1 8-9 2 1z" />
                    <defs />
                  </svg>
                </a>
              </motion.div>
              <dl>
                <dt className="text-2xl font-bold leading-5 text-white truncate mb-4 uppercase">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform"
                  >
                    Associe-se
                  </a>
                </dt>
                <dd className="mt-1 text-sm text-white">
                  Ao se associar à Ameciclo você já está contribuindo com o
                  movimento, pois aumenta o número de ciclistas que
                  representamos. As pessoas associadas podem participar das
                  reuniões ordinárias, tem voz e ajudam a construir nossas
                  políticas e diretrizes
                </dd>
              </dl>
            </div>
          </div>
          <div className="overflow-hidden bg-ameciclo rounded-lg shadow">
            <div className="px-4 py-5 lg:p-6 flex flex-col items-center text-center">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://doe.ameciclo.org"
                >
                  <svg
                    className="w-32 h-32 mb-4 text-ameciclo"
                    fill="currentColor"
                    viewBox="0 0 221 222"
                  >
                    <defs />
                    <path
                      fill="#fff"
                      d="M195 134c-7 24 22 13 9 35-14 21-17-10-36 7-18 17 12 24-11 35s-9-17-34-13-3 26-28 23 2-19-22-29c-23-10-16 20-36 4-19-16 12-15-2-36s-25 8-33-16c-7-24 18-7 18-32-1-25-25-6-19-31 7-24 18 4 32-17 13-22-18-19 1-36s13 13 36 2S66 4 90 0c25-4 4 19 29 22 26 3 11-24 34-14s-7 18 13 34c19 16 21-15 35 6s-15 11-7 35c7 24 25 0 26 25s-19 1-25 26z"
                    />
                    <path d="M111 70c-3 1-5 4-7 7-1 3-1 10 1 13 1 3 19 22 21 23s19-17 22-23 2-14-2-18c-2-2-7-4-10-4-2 0-6 1-8 3-1 1-2 1-5-1-4-2-7-2-12-1zm12 4c3 3 4 3 7 1l4-3c5-1 11 3 12 9 1 5-1 9-11 18l-8 9-8-8c-9-9-12-12-12-17s2-8 5-10c4-2 7-1 11 1z" />
                    <path d="M155 104l-6 5-7 6c-4 3-4 3-11 3-10-1-13-1-21-5-15-7-23-7-37 2-7 4-7 4-8 3 0-1-1-1-7 1l-7 2 14 32 6-3 6-5c0-3 4-5 11-5 6 0 8 0 17 3 12 3 12 3 17 2 10-2 17-6 27-13 8-6 20-21 20-25l-2-3c-2-2-8-2-12 0zm9 3c0 2-1 4-7 12a63 63 0 01-37 22l-14-2c-12-4-20-4-26-1l-5 1-2-3-3-8-2-5 5-3c14-10 22-10 35-4 8 4 13 5 20 5l8 1c2 1 2 3-1 6s-4 3-11 1l-13-2h-7v5h7l11 1c7 1 12 1 15-1 3-3 4-6 4-9 0-2 0-3 3-4l8-7 6-5h6zm-96 26l4 11c0 1-1 2-3 2l-2 2-5-11c-6-14-6-13-3-14l3-1 6 11z" />
                  </svg>
                </a>
              </motion.div>
              <dl>
                <dt className="text-2xl font-bold leading-5 text-white truncate mb-4 uppercase">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://doe.ameciclo.org"
                  >
                    Doe
                  </a>
                </dt>
                <dd className="mt-1 text-sm text-white">
                  <strong>Doe um pouco e ajude muito!</strong> <br />A Ameciclo
                  precisa de recursos para manter suas várias frentes de
                  atuação. Você pode doar mesmo sem ser um sócio.
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <ReactMapGl
          {...viewport}
          mapboxApiAccessToken={
            "pk.eyJ1IjoiaWFjYXB1Y2EiLCJhIjoiODViMTRmMmMwMWE1OGIwYjgxNjMyMGFkM2Q5OWJmNzUifQ.OFgXp9wbN5BJlpuJEcDm4A"
          }
          scrollZoom={false}
          onViewportChange={(viewport) => {
            setViewPort(viewport);
          }}
          attributionControl={false}
        >
          <div style={{ position: "absolute", right: 0 }}>
            <NavigationControl />
          </div>
          <Popup
            latitude={-8.0592989}
            longitude={-34.8801119}
            closeButton={false}
          >
            <h2>Sede da Ameciclo</h2>
            <p>R. da Aurora, 529, loja 2- Santo Amaro, Recife/PE, 50050-145 </p>
            <p>+55 (81) 9 9458-6830</p>
          </Popup>
        </ReactMapGl>
      </section>
    </Layout>
  );
};

export default Contato;
