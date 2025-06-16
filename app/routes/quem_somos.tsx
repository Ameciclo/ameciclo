import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ReactMarkdown from "react-markdown";

import SEO from "~/components/Commom/SEO";
import { Tab, TabPanel, Tabs, TabsNav } from "~/components/QuemSomos/Tabs";
import Breadcrumb from "~/components/Commom/Breadcrumb";

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

export const loader: LoaderFunction = async () => {
  const server = "https://cms.ameciclo.org";

  const resAme = await fetch(`${server}/ameciclistas`);
  const resCustom = await fetch(`${server}/quem-somos`);

  let ameciclistas: Ameciclista[] = [];
  let custom: CustomData | null = null;

  if (resAme.ok) {
    ameciclistas = await resAme.json();
  }
  if (resCustom.ok) {
    custom = await resCustom.json();
  }

  ameciclistas.sort((a, b) => a.name.localeCompare(b.name));

  return json({ ameciclistas, custom });
};

export const meta: MetaFunction = () => {
  return [{ title: "Quem Somos" }];
};

export default function QuemSomos() {
  const { ameciclistas, custom } = useLoaderData<typeof loader>();

  const coordinators = ameciclistas.filter((a: any) => a.role === "coordenacao");
  const counselors = ameciclistas.filter((a: any) => a.role === "conselhofiscal");

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
            {coordinators.map((c: any) => (
              <div className="max-w-sm p-4" key={c.id}>
                <div className="bg-white rounded shadow-lg" style={{ minHeight: "450px" }}>
                  {c.media ? (
                    <img src={c.media.url} alt={c.name} className="w-full h-64 object-cover rounded-t" />
                  ) : (
                    <div className="h-64 bg-gray-200 rounded-t" />
                  )}
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">{c.name}</h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>

          <TabPanel name="tab-conselho">
            {counselors.map((c: any) => (
              <div className="max-w-sm p-4" key={c.id}>
                <div className="bg-white rounded shadow-lg" style={{ minHeight: "450px" }}>
                  {c.media ? (
                    <img src={c.media.url} alt={c.name} className="w-full h-64 object-cover rounded-t" />
                  ) : (
                    <div className="h-64 bg-gray-200 rounded-t" />
                  )}
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">{c.name}</h2>
                    <p className="text-sm text-gray-600">{c.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>

          <TabPanel name="tab-ameciclista">
            {ameciclistas.map((c: any) => (
              <div className="max-w-sm p-4" key={c.id}>
                <div className="bg-white rounded shadow-lg min-h-[270px] min-w-[270px]">
                  <div className="aspect-w-1 aspect-h-1">
                    {c.media ? (
                      <img src={c.media.url} alt={c.name} className="w-full h-64 object-cover rounded-t" />
                    ) : (
                      <div className="h-64 bg-gray-200 rounded-t" />
                    )}
                  </div>
                  <div className="p-4 pb-6">
                    <h2 className="text-xl leading-normal text-gray-900">{c.name}</h2>
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
}
