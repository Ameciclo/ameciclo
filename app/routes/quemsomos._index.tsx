import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

import AmeCiclistaModal from "~/components/QuemSomos/AmeCiclistaModal";
import InfoSectionLoading from "~/components/QuemSomos/InfoSectionLoading";
import AmeciclistasLoading from "~/components/QuemSomos/AmeciclistasLoading";

import SEO from "~/components/Commom/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "~/components/QuemSomos/Tabs";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { loader } from "~/loader/quemsomos";
export { loader };

type Ameciclista = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  media?: { url: string };
};

type CustomData = {
  definition: string;
  objective: string;
  links: { id: string; title: string; link: string }[];
};



export const meta: MetaFunction = () => {
  return [{ title: "Quem Somos" }];
};

function QuemSomosContent({ pageData }: { pageData: any }) {
  const { ameciclistas = [], custom = {}, ameciclistasLoading = false, customLoading = false } = pageData || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmeciclista, setSelectedAmeciclista] = useState(null);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);

  const handleCardClick = (ameciclista: any, event: React.MouseEvent<HTMLButtonElement>) => {
    setLastFocusedElement(event.currentTarget);
    setSelectedAmeciclista(ameciclista);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAmeciclista(null);
    if (lastFocusedElement) {
      setTimeout(() => lastFocusedElement.focus(), 0);
    }
  };

  const coordinators = ameciclistas.filter((a: any) => a.role === "coordenacao");
  const counselors = ameciclistas.filter((a: any) => a.role === "conselhofiscal" || a.role === "concelhofiscal");

  return (
    <div className="container mx-auto mt-8 mb-8">
        {customLoading ? (
          <InfoSectionLoading />
        ) : (
          <div className="flex flex-wrap p-16 mx-auto text-white rounded bg-ameciclo lg:mx-0">
            <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
              <div className="text-lg lg:text-3xl">
                <ReactMarkdown>{custom?.definition}</ReactMarkdown>
              </div>
            </div>
            <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
              <p className="mb-2 text-xs tracking-wide text-white lg:text-base">
                {custom?.objective}
              </p>
              <div className="flex flex-wrap items-start justify-start max-w-5xl mx-auto mt-8 lg:mt-0">
                {custom?.links?.map((l: any) => (
                  <a
                    key={l.id}
                    href={l.link}
                    className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase bg-transparent border-2 border-white rounded shadow hover:bg-white hover:text-ameciclo focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ameciclo sm:mr-2"
                    style={{ transition: "all .15s ease" }}
                  >
                    {l.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <Tabs initialValue="tab-ameciclista">
          <TabsNav>
            <Tab name="tab-ameciclista">Ameciclistas</Tab>
            <Tab name="tab-coord">Coordenação</Tab>
            <Tab name="tab-conselho">Conselho Fiscal</Tab>
          </TabsNav>

          <TabPanel name="tab-coord">
            {ameciclistasLoading ? <AmeciclistasLoading /> : (
              coordinators.map((c: any) => (
                <div 
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4" 
                  key={c.id}
                >
                  <button
                    className="w-full text-left bg-white rounded-lg shadow-lg flex flex-col overflow-hidden cursor-pointer focus:ring-2 focus:ring-ameciclo focus:ring-offset-2"
                    onClick={(e) => handleCardClick(c, e)}
                  >
                    <div className="relative w-full h-64 overflow-hidden">
                      {c.media ? (
                        <img src={c.media.url} alt={c.name} className="absolute w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-4">{c.bio}</p>
                      {c.bio && c.bio.length > 150 && (
                        <span className="text-xs text-gray-500 mt-1 block">... ver mais</span>
                      )}
                    </div>
                  </button>
                </div>
              ))
            )}
          </TabPanel>

          <TabPanel name="tab-conselho">
            {ameciclistasLoading ? <AmeciclistasLoading /> : (
              counselors.map((c: any) => (
                <div 
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4" 
                  key={c.id}
                >
                  <button
                    className="w-full text-left bg-white rounded-lg shadow-lg flex flex-col overflow-hidden cursor-pointer focus:ring-2 focus:ring-ameciclo focus:ring-offset-2"
                    onClick={(e) => handleCardClick(c, e)}
                  >
                    <div className="relative w-full h-64 overflow-hidden">
                      {c.media ? (
                        <img src={c.media.url} alt={c.name} className="absolute w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-4">{c.bio}</p>
                      {c.bio && c.bio.length > 150 && (
                        <span className="text-xs text-gray-500 mt-1 block">... ver mais</span>
                      )}
                    </div>
                  </button>
                </div>
              ))
            )}
          </TabPanel>

          <TabPanel name="tab-ameciclista">
            {ameciclistasLoading ? <AmeciclistasLoading /> : (
              ameciclistas.map((c: any) => (
                <div 
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4" 
                  key={c.id}
                >
                  <button
                    className="w-full text-left bg-white rounded-lg shadow-lg flex flex-col overflow-hidden cursor-pointer focus:ring-2 focus:ring-ameciclo focus:ring-offset-2"
                    onClick={(e) => handleCardClick(c, e)}
                  >
                    <div className="relative w-full h-64 overflow-hidden">
                      {c.media ? (
                        <img src={c.media.url} alt={c.name} className="absolute w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
                    </div>
                  </button>
                </div>
              ))
            )}
          </TabPanel>
        </Tabs>

        <AmeCiclistaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          ameciclista={selectedAmeciclista}
        />
    </div>
  );
}



export default function QuemSomos() {
  const { pageData, apiErrors } = useLoaderData<typeof loader>();
  const { addApiError } = useApiStatus();
  
  useEffect(() => {
    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error: {url: string, error: string}) => {
        addApiError(error.url, error.error, '/quemsomos');
      });
    }
  }, [apiErrors, addApiError]);

  return (
    <>
      <SEO title="Quem Somos" />
      <div className="relative py-24 w-full h-[52vh]">
        <img
          src="/quem_somos.webp"
          alt="Quem somos?"
          className="absolute inset-0 object-cover w-full h-full"
          loading="lazy"
        />
      </div>
      <Breadcrumb label="Quem Somos" slug="/quem_somos" routes={["/"]} />
      <QuemSomosContent pageData={pageData} />
    </>
  );
}
