import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FeaturedProject } from "../components/FeaturedProject";
import Counter from "../components/Counter";
import Apoie from "../components/Icons/apoie";
import Associe from "../components/Icons/associe";
import Participe from "../components/Icons/participe";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { server } from "../config";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { on } from "stream";

export default function Home({
  featuredProjects,
  numberOfProjects,
  ongoingProjects,
  featuredProducts,
  home,
  recurrent,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

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
          <div className="navigation-wrapper">
            <div ref={sliderRef} className="keen-slider">
              {featuredProjects.map((p) => (
                <FeaturedProject project={p} key={p.id} />
              ))}
            </div>
            {loaded && instanceRef.current && (
              <>
                <Arrow
                  left
                  onClick={(e: any) =>
                    e.stopPropagation() || instanceRef.current?.prev()
                  }
                  disabled={currentSlide === 0}
                />

                <Arrow
                  onClick={(e: any) =>
                    e.stopPropagation() || instanceRef.current?.next()
                  }
                  disabled={
                    currentSlide ===
                    instanceRef.current.track.details.slides.length - 1
                  }
                />
              </>
            )}
          </div>
          {/* <Swiper
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
          </Swiper> */}
        </div>
      </section>
      <section className="bg-ameciclo">
        <div className="container px-6 py-20 mx-auto">
          <div className="flex flex-wrap justify-around">
          <Counter label={"Projetos em Andamento"} number={ongoingProjects} />
          <Counter label={"Projetos Realizados"} number={numberOfProjects} />
            <Counter label={"Pessoas Associadas"} number={1306} />
            {/*<Counter label={"Horas de Envolvimento"} number={1000} />*/}
          </div>
        </div>
      </section>
      {featuredProducts.length > 0 && (
        <section>
          <div className="mx-auto">
            {/* <Swiper
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
            </Swiper> */}
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

  // Filtrar projetos que não terminam com "_es" ou "_en"
  const validProjects = projects.filter(
    (project) => !project.slug.endsWith("_es") && !project.slug.endsWith("_en")
  );

  // Contar o total de projetos válidos
  const numberOfProjects = validProjects.length;

  // Contar projetos ativos com base no status
  const ongoingProjects = validProjects.filter(
    (project) => project.status === "ongoing"
  ).length;

  return {
    props: {
      featuredProjects,
      numberOfProjects,
      ongoingProjects,
      featuredProducts,
      home,
      recurrent,
    },
  };
}

function Arrow(props: {
  disabled: boolean;
  left?: boolean;
  onClick: (e: any) => void;
}) {
  const disabeld = props.disabled ? " arrow--disabled" : "";
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${
        props.left ? "arrow--left" : "arrow--right"
      } ${disabeld}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {props.left && (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  );
}
