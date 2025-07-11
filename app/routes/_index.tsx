import SectionCallToAction from "~/components/PaginaInicial/SectionCallToAction";
import SectionCarousel from "~/components/PaginaInicial/SectionCarousel";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { loader } from "../loader/home"
import SectionData from "~/components/PaginaInicial/SectionData";
import bannerImage from "/backgroundImage.webp";
import HomeBanner from "~/components/PaginaInicial/HomeBanner";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { useEffect } from "react";
export { loader };

export default function Index() {
  const { home, featuredProjects, allProjects, apiDown } = useLoaderData<any>();
  const navigation = useNavigation();
  const { setApiDown } = useApiStatus();
  const isLoading = navigation.state === "loading";
  
  // Loading específico para cada seção baseado nos dados necessários
  const carouselNeedsLoading = isLoading || !featuredProjects || featuredProjects.length === 0;
  const dataHasApiError = !allProjects || allProjects.length === 0;
  
  useEffect(() => {
    setApiDown(apiDown);
  }, [apiDown, setApiDown]);
  
  return (
    <>
      <ApiStatusHandler apiDown={apiDown} />
      <HomeBanner 
        image={bannerImage} 
        alt="Várias mulheres (11) de bicicleta andando na rua ocupando duas faixas e atravessando um cruzamento"
      />
      <SectionCallToAction home={home} />
      <SectionCarousel 
        featuredProjects={featuredProjects} 
        isLoading={carouselNeedsLoading}
        hasApiError={false}
      />
      <SectionData projects={allProjects} apiDown={dataHasApiError} />
    </>
  )
}