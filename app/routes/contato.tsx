import { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import ReactMapGl, { NavigationControl, Popup } from "react-map-gl";
import { motion } from "framer-motion";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import Participe from "~/components/Icons/participe";
import Associe from "~/components/Icons/associe";
import Apoie from "~/components/Icons/apoie";

import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";

// 🔹 SEO para Remix
export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

// 🔹 Token da API do Mapbox (use variável de ambiente no Remix)
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || "SEU_TOKEN_AQUI";

export default function Contato() {
  // 🔹 Configuração inicial do mapa
  const [viewport, setViewPort] = useState({
    latitude: -8.0592989,
    longitude: -34.8801119,
    zoom: 15,
    width: "100%",
    height: "400px",
  });

  // 🔹 Evitar erro no SSR verificando `window`
  const isClient = typeof window !== "undefined";

  return (
    <>
      <Banner image={bannerContatact} alt="Mulher negra de cabelo crespo volumoso andando de bicicleta com camisa branca de costas no canto direito do banner, passando ao lado de um bicicletário com várias bicicletas e cones que protegem este bicicletário" />
      <Breadcrumb label="Contato" slug="/contato" routes={["/", "/contato"]} />
      <section className="container mx-auto my-12">
        <div className="grid grid-cols-1 gap-6 mx-3 mt-5 lg:grid-cols-3">
          {/* 🔹 Card 1 - Participe */}
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Participe />
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  <strong>Escolha a melhor forma de participar!</strong> <br />
                  Existem várias maneiras de ajudar a Ameciclo, cada pessoa pode se envolver de um jeito. (EM CONSTRUÇÃO)
                </dd>
              </dl>
            </div>
          </div>

          {/* 🔹 Card 2 - Associe-se */}
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a target="_blank" rel="noopener noreferrer" href="http://queroser.ameciclo.org">
                  <Associe />
                </a>
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  Ao associar-se à nós você fortalece o movimento cicloativista, aumentando a representação da Ameciclo. As pessoas associadas podem participar das reuniões, projetos, ações e dão a voz que ajuda a construir nossas políticas e diretrizes.
                </dd>
              </dl>
            </div>
          </div>

          {/* 🔹 Card 3 - Apoie */}
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a target="_blank" rel="noopener noreferrer" href="http://apoie.ameciclo.org">
                  <Apoie />
                </a>
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  <strong>Apoie para realizarmos ainda mais!</strong> <br />
                  A Ameciclo precisa de recursos para manter suas várias frentes de atuação. Você pode doar mesmo sem ser uma pessoa associada.
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Mapa - Renderiza apenas no cliente para evitar erro no SSR */}
      {isClient && (
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
            <Popup latitude={-8.0592989} longitude={-34.8801119} closeButton={false}>
              <h2 className="font-bold">Sede da Ameciclo</h2>
              <p>R. da Aurora, 529, loja 2 - Santo Amaro, Recife/PE, 50050-145 </p>
              <p>+55 (81) 9 9458-6830</p>
            </Popup>
          </ReactMapGl>
        </section>
      )}
    </>
  );
}
