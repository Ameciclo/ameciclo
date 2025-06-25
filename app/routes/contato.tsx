import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

import Breadcrumb from "~/components/Commom/Breadcrumb";
import Participe from "~/components/Commom/Icones/participe";
import Associe from "~/components/Commom/Icones/associe";
import Apoie from "~/components/Commom/Icones/apoie";

import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";



export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

export default function Contato() {

  return (
    <>
      <Banner image={bannerContatact} alt="Mulher negra de cabelo crespo volumoso andando de bicicleta com camisa branca de costas no canto direito do banner, passando ao lado de um bicicletário com várias bicicletas e cones que protegem este bicicletário" />
      <Breadcrumb label="Contato" slug="/contato" routes={["/"]} />
      <section className="container mx-auto my-12">
        <div className="grid grid-cols-1 gap-6 mx-3 mt-5 lg:grid-cols-3">
          <div className="overflow-hidden rounded-lg shadow bg-ameciclo">
            <div className="flex flex-col items-center px-4 py-5 text-center lg:p-6">
              <motion.div whileHover={{ scale: 1.1 }}>
                <a href="/participe">
                  <Participe />
                </a>
              </motion.div>
              <dl>
                <dd className="mt-1 text-sm text-white">
                  <strong>Escolha a melhor forma de participar!</strong> <br />
                  Existem várias maneiras de ajudar a Ameciclo, cada pessoa pode se envolver de um jeito. (EM CONSTRUÇÃO)
                </dd>
              </dl>
            </div>
          </div>

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
      <section className="w-full h-96 mb-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.2847!2d-34.8823!3d-8.0593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab18a59c7b4b0b%3A0x123456789!2sR.%20da%20Aurora%2C%20529%20-%20Santo%20Amaro%2C%20Recife%20-%20PE!5e0!3m2!1spt-BR!2sbr!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização da Sede da Ameciclo"
        />
      </section>
    </>
  );
}