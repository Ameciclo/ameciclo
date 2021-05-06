import React, { useState } from "react";
import ReactMapGl, { NavigationControl, Popup } from "react-map-gl";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import Participe from "../components/Icons/participe";
import Associe from "../components/Icons/associe";
import Apoie from "../components/Icons/apoie";
import { server } from "../config";


const Contato = ({footer}) => {
  const [viewport, setViewPort] = useState({
    latitude: -8.0592989,
    longitude: -34.8801119,
    zoom: 15,
    width: "100%",
    height: "400px",
  });
  return (
    <Layout footer = {footer}>
      <SEO title="Contato" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/contato.webp')`,
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
          <div className="overflow-hidden bg-ameciclo rounded-lg shadow">
            <div className="px-4 py-5 lg:p-6 flex flex-col items-center text-center">
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
                  Ao associar-se à nós você fortalece o movimento
                  cicloativista, aumentando a representação da Ameciclo.
                  As pessoas associadas podem participar das reuniões, 
                  projetos, ações e dão a voz que ajuda a construir nossas
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
                  href="http://apoie.ameciclo.org"
                >
                  <Apoie />
                </a>
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  <strong>Apoie para realizarmos ainda mais!</strong> <br />A Ameciclo
                  precisa de recursos para manter suas várias frentes de
                  atuação. Você pode doar mesmo sem ser uma pessoa associada.
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

export async function getStaticProps() {

  const res_footer = await fetch(`${server}/footer`);
  let footer;
  if (res_footer.status === 200) {
    footer = await res_footer.json();
  }
 
  return {
    props: {
      footer,
    },
  };
}

export default Contato;
