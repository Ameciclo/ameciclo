import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

import AmeCiclistaModal from "~/components/QuemSomos/AmeCiclistaModal";

import SEO from "~/components/Commom/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "~/components/QuemSomos/Tabs";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import QuemSomosLoading from "~/components/QuemSomos/QuemSomosLoading";
import { ApiStatusHandler } from "~/components/Commom/ApiStatusHandler";
import { useApiStatus } from "~/contexts/ApiStatusContext";
import { loader } from "~/loader/quem_somos";
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
  const { ameciclistas, custom } = pageData;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmeciclista, setSelectedAmeciclista] = useState(null);

  const handleCardClick = (ameciclista: any) => {
    setSelectedAmeciclista(ameciclista);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAmeciclista(null);
  };

  const coordinators = ameciclistas.filter((a: any) => a.role === "coordenacao");
  const counselors = ameciclistas.filter((a: any) => a.role === "conselhofiscal");

  return (
    <div className="container mx-auto mt-8 mb-8">
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
              {custom?.links.map((l: any) => (
                <a
                  key={l.id}
                  href={l.link}
                  className="px-4 py-2 mb-2 text-xs font-bold text-white uppercase bg-transparent border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
                  style={{ transition: "all .15s ease" }}
                >
                  {l.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        <Tabs initialValue="tab-ameciclista">
          <TabsNav>
            <Tab name="tab-ameciclista">Ameciclistas</Tab>
            <Tab name="tab-coord">Coordenação</Tab>
            <Tab name="tab-conselho">Conselho Fiscal</Tab>
          </TabsNav>

          <TabPanel name="tab-coord">
            <div className="flex flex-wrap -m-4 justify-center">
              {coordinators.map((c: any) => (
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 cursor-pointer" key={c.id} onClick={() => handleCardClick(c)}>
                  <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <div className="relative w-full h-64 overflow-hidden">
                      {c.media ? (
                        <img src={c.media.url} alt={c.name} className="absolute w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
                      <p className="text-sm text-gray-600 mt-2">{c.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>

          <TabPanel name="tab-conselho">
            <div className="flex flex-wrap -m-4 justify-center">
              {counselors.map((c: any) => (
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 cursor-pointer" key={c.id} onClick={() => handleCardClick(c)}>
                  <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <div className="relative w-full h-64 overflow-hidden">
                      {c.media ? (
                        <img src={c.media.url} alt={c.name} className="absolute w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
                      <p className="text-sm text-gray-600 mt-2">{c.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>

          <TabPanel name="tab-ameciclista">
            <div className="flex flex-wrap -m-4 justify-center">
              {ameciclistas.map((c: any) => (
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 cursor-pointer" key={c.id} onClick={() => handleCardClick(c)}>
                  <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
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
                  </div>
                </div>
              ))}
            </div>
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
  const { pageData, isLoading, apiDown, apiErrors } = useLoaderData<typeof loader>();
  const { setApiDown, addApiError } = useApiStatus();
  
  useEffect(() => {
    setApiDown(apiDown);
    if (apiErrors && apiErrors.length > 0) {
      apiErrors.forEach((error: {url: string, error: string}) => {
        addApiError(error.url, error.error, '/quem_somos');
      });
    }
  }, []);

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
      <ApiStatusHandler apiDown={apiDown} />
      {isLoading ? <QuemSomosLoading /> : <QuemSomosContent pageData={pageData} />}
    </>
  );
}
