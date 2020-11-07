import styles from "../styles/Home.module.css";
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

export default function Home({ featuredProjects, numberOfProjects }) {
  return (
    <Layout>
      <SEO title="Página Principal" />
      <section className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill hero-image" />
      <section className="bg-ameciclo">
        <div className="mx-auto px-6 py-20 container">
          <div className="flex flex-wrap justify-around">
            <div className="p-4 text-center">
              <motion.div whileHover={{ scale: 1.1 }}>
                <svg
                  className="w-48 h-48 mb-4 text-ameciclo"
                  fill="currentColor"
                  viewBox="0 0 220 221"
                >
                  <defs />
                  <path
                    fill="#fff"
                    d="M195 134c-7 24 22 13 9 35-14 21-17-10-36 7-18 17 12 24-11 35s-9-17-34-13-3 26-28 23 2-19-22-29c-23-10-16 20-36 4-19-16 12-15-2-36s-25 8-33-16c-7-24 18-7 18-32-1-25-25-6-19-31 7-24 18 4 32-17 13-22-18-19 1-36s13 13 36 2S66 4 90 0c25-4 4 19 29 22 26 3 11-24 34-14s-7 18 13 34c19 16 21-15 35 6s-15 11-7 35c7 24 25 0 26 25s-19 1-25 26z"
                  />
                  <path d="M134 52l-6 6a92 92 0 01-45 30c-12 4-18 7-22 10-3 3-3 4-3 12 0 7 1 8 2 11 4 5 9 7 18 7h7l-2 6c-5 11-4 31 1 34 3 2 12 2 16 0 5-2 6-4 4-9-2-8-2-20 1-27l2-6h4c7 0 18 3 29 7 12 5 13 5 17 3 2-2 2-5-1-19l-2-8 3-3c4-3 5-6 5-12 0-8-5-14-13-16-2 0-3-3-4-8-2-13-3-15-5-17-1-2-4-2-6-1zm12 42l7 38-4-1c-3-1-3-1-11-34l-7-34 2-3 3-2 10 36zm-13 3l7 29-8-1c-9-3-21-5-30-5h-6l-3-13-3-14 8-5c9-4 22-13 26-17l2-2 7 28zm22-9c2 3 2 9 0 13l-2 2-1-3-2-9-1-6c0-2 3 0 6 3zm-68 19l3 14-11 1-9 1-4-4c-3-3-3-4-3-8 0-6 1-9 4-11l16-6c1-1 3 5 4 13zm13 24c-3 8-4 17-2 25l1 7-2 1c-4 1-9 1-10-1-1-1-2-5-2-11 0-8 1-10 3-17 3-8 4-9 10-9l4-1-2 6z" />
                </svg>
              </motion.div>
              <span className="uppercase text-xl text-white font-extrabold tracking-wider">
                Participe
              </span>
            </div>
            <div className="p-4 text-center">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <svg
                    className="w-48 h-48 mb-4 text-ameciclo"
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
                </motion.div>
                <span className="uppercase text-xl text-white font-extrabold tracking-wider">
                  Associe-se
                </span>
              </a>
            </div>
            <div className="p-4 text-center">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="http://doe.ameciclo.org"
              >
                <motion.div whileHover={{ scale: 1.1 }}>
                  <svg
                    className="w-48 h-48 mb-4 text-ameciclo"
                    fill="currentColor"
                    viewBox="0 0 220 221"
                  >
                    <defs />
                    <path
                      fill="#fff"
                      d="M195 134c-7 24 22 13 9 35-14 21-17-10-36 7-18 17 12 24-11 35s-9-17-34-13-3 26-28 23 2-19-22-29c-23-10-16 20-36 4-19-16 12-15-2-36s-25 8-33-16c-7-24 18-7 18-32-1-25-25-6-19-31 7-24 18 4 32-17 13-22-18-19 1-36s13 13 36 2S66 4 90 0c25-4 4 19 29 22 26 3 11-24 34-14s-7 18 13 34c19 16 21-15 35 6s-15 11-7 35c7 24 25 0 26 25s-19 1-25 26z"
                    />
                    <path d="M111 70c-3 1-5 4-7 7-1 3-1 10 1 13 1 3 19 22 21 23s19-17 22-23 2-14-2-18c-2-2-7-4-10-4-2 0-6 1-8 3-1 1-2 1-5-1-4-2-7-2-12-1zm12 4c3 3 4 3 7 1l4-3c5-1 11 3 12 9 1 5-1 9-11 18l-8 9-8-8c-9-9-12-12-12-17s2-8 5-10c4-2 7-1 11 1z" />
                    <path d="M155 104l-6 5-7 6c-4 3-4 3-11 3-10-1-13-1-21-5-15-7-23-7-37 2-7 4-7 4-8 3 0-1-1-1-7 1l-7 2 14 32 6-3 6-5c0-3 4-5 11-5 6 0 8 0 17 3 12 3 12 3 17 2 10-2 17-6 27-13 8-6 20-21 20-25l-2-3c-2-2-8-2-12 0zm9 3c0 2-1 4-7 12a63 63 0 01-37 22l-14-2c-12-4-20-4-26-1l-5 1-2-3-3-8-2-5 5-3c14-10 22-10 35-4 8 4 13 5 20 5l8 1c2 1 2 3-1 6s-4 3-11 1l-13-2h-7v5h7l11 1c7 1 12 1 15-1 3-3 4-6 4-9 0-2 0-3 3-4l8-7 6-5h6zm-96 26l4 11c0 1-1 2-3 2l-2 2-5-11c-6-14-6-13-3-14l3-1 6 11z" />
                  </svg>
                </motion.div>
                <span className="uppercase text-xl text-white font-extrabold tracking-wider">
                  Doe
                </span>
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
                  interval: 2000,
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
            <Counter label={"Associados"} number={650} />
            <Counter label={"Horas de Envolvimento"} number={1000} />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const res = await fetch("https://cms.ameciclo.org/projects");
  const projects = await res.json();
  const featuredProjects = projects.filter((p) => {
    return p.isHighlighted === true;
  });
  const numberOfProjects = projects.length;
  return {
    props: {
      featuredProjects,
      numberOfProjects,
    },
  };
}
