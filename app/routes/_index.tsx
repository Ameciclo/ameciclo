import SectionCallToAction from "~/components/PaginaInicial/SectionCallToAction";
import SectionCarousel from "~/components/PaginaInicial/SectionCarousel";
import { useLoaderData, useNavigate } from "@remix-run/react";
import SectionData from "~/components/PaginaInicial/SectionData";
import bannerImage from "/backgroundImage.webp";
import HomeBanner from "~/components/PaginaInicial/HomeBanner";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import CachePermissionBar from "~/components/Commom/CachePermissionModal";
import { useEffect, useState } from "react";
import { loader } from "../loader/home";
export { loader };

export default function Index() {
  const { home, projects, apiDown, apiErrors } = useLoaderData<any>();
  const { setApiDown, addApiError } = useApiStatus();
  
  useEffect(() => {
    if (apiDown !== undefined) {
      setApiDown(apiDown);
    }
    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error: {url: string, error: string}) => {
        addApiError(error.url, error.error, '/');
      });
    }
  }, [apiDown, apiErrors]);

  const handleCacheAllow = () => {
    window.location.reload();
  };

  const handleCacheDeny = () => {
    // Modal fechado
  };
  
  return (
    <>
      <HomeBanner 
        image={bannerImage} 
        alt="Várias mulheres (11) de bicicleta andando na rua ocupando duas faixas e atravessando um cruzamento"
      />
      <ApiStatusHandler apiDown={apiDown} />
      
      <SectionCallToAction home={home} />
      <SectionCarousel 
        featuredProjects={home.projects} 
        isLoading={false}
        hasApiError={false}
      />
      <SectionData 
        projects={projects} 
        apiDown={!projects || projects.length === 0} 
      />
      
      <CachePermissionBar 
        onAllow={handleCacheAllow}
        onDeny={handleCacheDeny}
      />
    </>
  );
}