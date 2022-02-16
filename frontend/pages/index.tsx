import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Image from "next/image";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FeaturedProject } from "../components/FeaturedProject";
import Counter from "../components/Counter";
import Apoie from "../components/Icons/apoie";
import Associe from "../components/Icons/associe";
import Participe from "../components/Icons/participe";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { server } from "../config";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react.js";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
  EffectFade,
  Lazy,
} from "swiper";
import "swiper/swiper.scss";
import "swiper/modules/navigation/navigation.scss"; // Navigation module
import "swiper/modules/pagination/pagination.scss"; // Pagination module

export default function Home({
  featuredProjects,
  numberOfProjects,
  featuredProducts,
  home,
  recurrent,
}) {
  return (
    <Layout>
      <SEO title="Página Principal" />
      <section className="h-[70vh] w-full relative overflow-hidden py-[58px]">
        <Image
          src={"/backgroundImage.webp"}
          alt="Ameciclo Banner"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority={true}
        />
      </section>
      <section className="bg-ameciclo">
        <div className="container px-6 py-20 mx-auto">
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
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay, Lazy]}
            lazy={true}
            loop={true}
            preloadImages={false}
            spaceBetween={50}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 4000 }}
          >
            {featuredProjects.map((p) => (
              <SwiperSlide key={p.id}>
                <FeaturedProject project={p} key={p.id} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      <section className="bg-ameciclo">
        <div className="container px-6 py-20 mx-auto">
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
            <Swiper
              modules={[
                Navigation,
                Pagination,
                Scrollbar,
                A11y,
                Autoplay,
                EffectFade,
              ]}
              spaceBetween={50}
              slidesPerView={1}
              navigation
              autoplay={{ delay: 4000 }}
              onSlideChange={() => console.log("slide change")}
              onSwiper={(swiper) => console.log(swiper)}
            >
              {featuredProducts.map((p) => (
                <SwiperSlide key={p.id}>
                  <FeaturedProducts project={p} key={p.id} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const res_current = await fetch(`https://apoia.se/api/v1/users/ameciclo`);

  let recurrent = [];
  if (res_current.status === 200) {
    recurrent = await res_current.json();
  }

  const res = await fetch(`${server}/projects`);
  if (res.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }
  const projects = await res.json();

  const res_carrossel = await fetch(`${server}/home`);
  if (res_carrossel.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }
  const home = await res_carrossel.json();

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
      recurrent,
    },
  };
}
