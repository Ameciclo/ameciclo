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
import SectionDataLoading from "~/components/PaginaInicial/SectionDataLoading";
import { loader } from "../loader/home";
export { loader };

export default function Index() {
  const { homePromise, projectsPromise, apiDown } = useLoaderData<any>();
  const { setApiDown } = useApiStatus();
  
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
      
      <Suspense fallback={<SectionCallToAction home={null} />}>
        <Await resolve={homePromise}>
          {(home) => <SectionCallToAction home={home} />}
        </Await>
      </Suspense>
      
      <Suspense fallback={<SectionCarouselLoading />}>
        <Await resolve={homePromise}>
          {(home) => (
            <SectionCarousel 
              featuredProjects={home?.projects || []} 
              isLoading={false}
              hasApiError={false}
            />
          )}
        </Await>
      </Suspense>
      
      <Suspense fallback={<SectionDataLoading />}>
        <Await resolve={projectsPromise}>
          {(allProjects) => (
            <SectionData 
              projects={allProjects} 
              apiDown={!allProjects || allProjects.length === 0} 
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}