import SectionCallToAction from "~/components/PaginaInicial/SectionCallToAction";
import SectionCarousel from "~/components/PaginaInicial/SectionCarousel";
import { useLoaderData, Await } from "@remix-run/react";
import SectionData from "~/components/PaginaInicial/SectionData";
import bannerImage from "/backgroundImage.webp";
import HomeBanner from "~/components/PaginaInicial/HomeBanner";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { useEffect, Suspense } from "react";
import { defer } from "@remix-run/node";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import SectionCarouselLoading from "~/components/PaginaInicial/SectionCarouselLoading";
import CounterLoading from "~/components/PaginaInicial/CounterLoading";
import { loader } from "../loader/home";
export { loader };

export default function Index() {
  const { home, featuredProjects, allProjects, apiDown } = useLoaderData<any>();
  const { setApiDown } = useApiStatus();
  
  const carouselNeedsLoading = !featuredProjects || featuredProjects.length === 0;
  const dataHasApiError = !allProjects || allProjects.length === 0;
  
  useEffect(() => {
    setApiDown(apiDown);
  }, [apiDown, setApiDown]);
  
  return (
    <>
      <HomeBanner 
        image={bannerImage} 
        alt="Várias mulheres (11) de bicicleta andando na rua ocupando duas faixas e atravessando um cruzamento"
      />
      <ApiStatusHandler apiDown={apiDown} />
      <SectionCallToAction home={home} />
      <Suspense fallback={<SectionCarouselLoading />}>
        <SectionCarousel 
          featuredProjects={featuredProjects} 
          isLoading={carouselNeedsLoading}
          hasApiError={false}
        />
      </Suspense>
      <Suspense fallback={
        <section className="bg-ameciclo">
          <div className="container px-6 py-20 mx-auto">
            <div className="flex flex-wrap justify-around">
              <CounterLoading label="Projetos" />
              <CounterLoading label="Contagens" />
              <CounterLoading label="Dados" />
            </div>
          </div>
        </section>
      }>
        <SectionData projects={allProjects} apiDown={dataHasApiError} />
      </Suspense>
    </>
  );
}