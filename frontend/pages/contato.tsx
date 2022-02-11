import React, { useState } from "react";
import ReactMapGl, { NavigationControl, Popup } from "react-map-gl";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import Participe from "../components/Icons/participe";
import Associe from "../components/Icons/associe";
import Apoie from "../components/Icons/apoie";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiaWFjYXB1Y2EiLCJhIjoiODViMTRmMmMwMWE1OGIwYjgxNjMyMGFkM2Q5OWJmNzUifQ.OFgXp9wbN5BJlpuJEcDm4A";

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
        className="object-fill h-auto px-10 py-24 text-white bg-center bg-cover"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/contato.webp')`,
        }}
      />
      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb
            label="Contato"
            slug="/contato"
            routes={["/", "/contato"]}
          />
        </div>
      </div>
      <section className="container mx-auto my-12">
        <div className="grid grid-cols-1 gap-6 mx-3 mt-5 lg:grid-cols-3">
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Participe />
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  <strong>Escolha a melhor forma de participar!</strong> <br />
                  Existem várias maneiras de ajudar a Ameciclo, cada pessoa pode
                  se envolver de um jeito. (EM CONSTRUÇÃO)
                </dd>
              </dl>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://queroser.ameciclo.org"
                >
                  <Associe />
                </a>
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  Ao associar-se à nós você fortalece o movimento cicloativista,
                  aumentando a representação da Ameciclo. As pessoas associadas
                  podem participar das reuniões, projetos, ações e dão a voz que
                  ajuda a construir nossas políticas e diretrizes
                </dd>
              </dl>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://apoie.ameciclo.org"
                >
                  <Apoie />
                </a>
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  <strong>Apoie para realizarmos ainda mais!</strong> <br />A
                  Ameciclo precisa de recursos para manter suas várias frentes
                  de atuação. Você pode doar mesmo sem ser uma pessoa associada.
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <ReactMapGl
          {...viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
          scrollZoom={false}
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
