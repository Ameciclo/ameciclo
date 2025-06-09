import { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { motion } from "framer-motion";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import Participe from "~/components/Icons/participe";
import Associe from "~/components/Icons/associe";
import Apoie from "~/components/Icons/apoie";

import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";
import DevelopingComponent from "~/components/Commom/DevelopingComponent";

// 🔹 SEO para Remix
export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

export default function Contato() {
  // 🔹 Evitar erro no SSR verificando `window`
  const isClient = typeof window !== "undefined";

  return (
    <>
      <Banner image={bannerContatact} alt="Mulher negra de cabelo crespo volumoso andando de bicicleta com camisa branca de costas no canto direito do banner, passando ao lado de um bicicletário com várias bicicletas e cones que protegem este bicicletário" />
      <Breadcrumb label="Contato" slug="/contato" routes={["/"]} />
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
      <DevelopingComponent title={"Mapa de localização da ameciclo"}/>
    </>
  );
}