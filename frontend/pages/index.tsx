import Layout from "../components/Layout";
import SEO from "../components/SEO";
import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const Carousel = dynamic(() => import("@brainhubeu/react-carousel"), {
  ssr: false,
});
import { arrowsPlugin, autoplayPlugin } from "@brainhubeu/react-carousel";
import { FeaturedProject } from "../components/FeaturedProject";
import "@brainhubeu/react-carousel/lib/style.css";
import Counter from "../components/Counter";
import Apoie from "../components/Icons/apoie";
import Associe from "../components/Icons/associe";
import Participe from "../components/Icons/participe";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { server } from "../config";

export default function Home({
  featuredProjects,
  numberOfProjects,
  featuredProducts,
  home,
}) {
  return (
    <Layout>
      <SEO title="Página Principal" />
      <section className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
              style={
                home.banner
                  ? {
                      width: "100%",
                      height: "70vh",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundImage: `url(${home.banner.url})`,
                    }
                  : {
                      width: "100%",
                      height: "70vh",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundImage: `url('/backgroundImage.webp')`,
                    }
                  }
                     />
      <section className="bg-ameciclo">
        <div className="mx-auto px-6 py-20 container">
          <div className="flex flex-wrap justify-around">
            <div className="p-4 text-center">
              <a href={home.participation_url}>
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Participe />
                  </motion.div>
              </a>
            </div>
            <div className="p-4 text-center">
              <a href={home.association_url}>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Associe />
                </motion.div>
              </a>
            </div>
            <div className="p-4 text-center">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={home.donate_url}
              >
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Apoie />
                </motion.div>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto">
          <Carousel
            animationSpeed={1000}
            plugins={[
              "infinite",
              {
                resolve: autoplayPlugin,
                options: {
                  interval: 4000,
                  stopAutoPlayOnHover: true,
                },
              },
              {
                resolve: arrowsPlugin,
                options: {
                  arrowLeft: (
                    <motion.button
                      className="text-gray-800 ml-4 absolute z-10 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                      whileTap={{ scale: 0.8 }}
                    >
                      <svg
                        aria-hidden="true"
                        className="text-gray-800 w-8 h-8"
                        data-icon="angle-double-left"
                        data-prefix="fas"
                        viewBox="0 0 448 512"
                      >
                        <defs />
                        <path
                          fill="currentColor"
                          d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z"
                        />
                      </svg>
                    </motion.button>
                  ),
                  arrowLeftDisabled: (
                    <motion.button
                      className="text-gray-800 ml-4 absolute z-10 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                      whileTap={{ scale: 0.8 }}
                    >
                      <svg
                        aria-hidden="true"
                        className="text-gray-800 w-8 h-8"
                        data-icon="angle-double-left"
                        data-prefix="fas"
                        viewBox="0 0 448 512"
                      >
                        <defs />
                        <path
                          fill="currentColor"
                          d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z"
                        />
                      </svg>
                    </motion.button>
                  ),
                  arrowRight: (
                    <motion.button
                      className="text-gray-800 ml-4 absolute z-10 right-0 mr-4 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                      whileTap={{ scale: 0.8 }}
                    >
                      <svg
                        aria-hidden="true"
                        className="text-gray-800 w-8 h-8"
                        data-icon="angle-double-right"
                        data-prefix="fas"
                        viewBox="0 0 448 512"
                      >
                        <defs />
                        <path
                          fill="currentColor"
                          d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
                        />
                      </svg>
                    </motion.button>
                  ),
                  arrowRightDisabled: (
                    <motion.button
                      className="text-gray-800 ml-4 absolute z-10 right-0 mr-4 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                      whileTap={{ scale: 0.8 }}
                    >
                      <svg
                        aria-hidden="true"
                        className="text-gray-800 w-8 h-8"
                        data-icon="angle-double-right"
                        data-prefix="fas"
                        viewBox="0 0 448 512"
                      >
                        <defs />
                        <path
                          fill="currentColor"
                          d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
                        />
                      </svg>
                    </motion.button>
                  ),
                  addArrowClickHandler: true,
                },
              },
            ]}
          >
            {featuredProjects.map((p) => (
              <FeaturedProject project={p} key={p.id} />
            ))}
          </Carousel>
        </div>
      </section>
      <section className="bg-ameciclo">
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-wrap justify-around">
            <Counter label={"Projetos Realizados"} number={numberOfProjects} />
            <Counter label={"Pessoas Associadas"} number={1106} />
            {/*<Counter label={"Horas de Envolvimento"} number={1000} />*/}
          </div>
        </div>
      </section>
      {featuredProducts.length > 0 && (
        <section>
          <div className="mx-auto">
            <Carousel
              animationSpeed={1000}
              plugins={[
                "infinite",
                {
                  resolve: autoplayPlugin,
                  options: {
                    interval: 3000,
                    stopAutoPlayOnHover: true,
                  },
                },
                {
                  resolve: arrowsPlugin,
                  options: {
                    arrowLeft: (
                      <motion.button
                        className="text-gray-800 ml-4 absolute z-10 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                        whileTap={{ scale: 0.8 }}
                      >
                        <svg
                          aria-hidden="true"
                          className="text-gray-800 w-8 h-8"
                          data-icon="angle-double-left"
                          data-prefix="fas"
                          viewBox="0 0 448 512"
                        >
                          <defs />
                          <path
                            fill="currentColor"
                            d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z"
                          />
                        </svg>
                      </motion.button>
                    ),
                    arrowLeftDisabled: (
                      <motion.button
                        className="text-gray-800 ml-4 absolute z-10 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                        whileTap={{ scale: 0.8 }}
                      >
                        <svg
                          aria-hidden="true"
                          className="text-gray-800 w-8 h-8"
                          data-icon="angle-double-left"
                          data-prefix="fas"
                          viewBox="0 0 448 512"
                        >
                          <defs />
                          <path
                            fill="currentColor"
                            d="M223.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L319.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L393.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34zm-192 34l136 136c9.4 9.4 24.6 9.4 33.9 0l22.6-22.6c9.4-9.4 9.4-24.6 0-33.9L127.9 256l96.4-96.4c9.4-9.4 9.4-24.6 0-33.9L201.7 103c-9.4-9.4-24.6-9.4-33.9 0l-136 136c-9.5 9.4-9.5 24.6-.1 34z"
                          />
                        </svg>
                      </motion.button>
                    ),
                    arrowRight: (
                      <motion.button
                        className="text-gray-800 ml-4 absolute z-10 right-0 mr-4 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                        whileTap={{ scale: 0.8 }}
                      >
                        <svg
                          aria-hidden="true"
                          className="text-gray-800 w-8 h-8"
                          data-icon="angle-double-right"
                          data-prefix="fas"
                          viewBox="0 0 448 512"
                        >
                          <defs />
                          <path
                            fill="currentColor"
                            d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
                          />
                        </svg>
                      </motion.button>
                    ),
                    arrowRightDisabled: (
                      <motion.button
                        className="text-gray-800 ml-4 absolute z-10 right-0 mr-4 rounded-full bg-white p-3 shadow-lg outline-none focus:outline-none hidden md:block"
                        whileTap={{ scale: 0.8 }}
                      >
                        <svg
                          aria-hidden="true"
                          className="text-gray-800 w-8 h-8"
                          data-icon="angle-double-right"
                          data-prefix="fas"
                          viewBox="0 0 448 512"
                        >
                          <defs />
                          <path
                            fill="currentColor"
                            d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
                          />
                        </svg>
                      </motion.button>
                    ),
                    addArrowClickHandler: true,
                  },
                },
              ]}
            >
              {featuredProducts.map((p) => (
                <FeaturedProducts project={p} key={p.id} />
              ))}
            </Carousel>
          </div>
        </section>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const res = await fetch(`${server}/projects`),
    res_carrossel = await fetch(`${server}/carrossels`);

  if (res.status !== 200 && res_carrossel.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  };

  const res = await fetch(`${server}/projects`);
  if (res.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  };
  const projects = await res.json();

  const res_carrossel = await fetch(`${server}/home`);
  if (res_carrossel.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  };
  const home = await res_carrossel.json();
  const products = await res_carrossel.json();

  let featuredProducts = [];

  if (home.products) {
    featuredProducts = home.products;
  }

  let featuredProjects = [];

  if (home.projects) {
    featuredProjects = home.projects;
  }
  
  const numberOfProjects = projects.length;

  return {
    props: {
      featuredProjects,
      numberOfProjects,
      featuredProducts,
      home,
    },
  };
}
