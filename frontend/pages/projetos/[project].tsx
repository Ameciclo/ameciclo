import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import Breadcrumb from "../../components/Breadcrumb";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import Carousel, { Modal, ModalGateway } from "react-images";
import { Rating } from "../../components/Rating";
import { StepCard } from "../../components/StepCard";
import ReactMarkdown from 'react-markdown'
import { PartnerCard } from "../../components/PartnerCard";


const PhotoGallery = dynamic(() => import("react-photo-gallery"), {
  ssr: false,
});

const ProjectDate = ({ project }) => {
  console.log("project.partners.length")

  console.log(project.partners.length)

  return (
    <div className="flex flex-row justify-center">
      <svg className="w-4 h-4 fill-current mr-2" viewBox="0 0 512 512">
        <defs />
        <path d="M452 40h-24V0h-40v40H124V0H84v40H60C26.916 40 0 66.916 0 100v352c0 33.084 26.916 60 60 60h392c33.084 0 60-26.916 60-60V100c0-33.084-26.916-60-60-60zm20 412c0 11.028-8.972 20-20 20H60c-11.028 0-20-8.972-20-20V188h432v264zm0-304H40v-48c0-11.028 8.972-20 20-20h24v40h40V80h264v40h40V80h24c11.028 0 20 8.972 20 20v48z" />
        <path d="M76 230h40v40H76zM156 230h40v40h-40zM236 230h40v40h-40zM316 230h40v40h-40zM396 230h40v40h-40zM76 310h40v40H76zM156 310h40v40h-40zM236 310h40v40h-40zM316 310h40v40h-40zM76 390h40v40H76zM156 390h40v40h-40zM236 390h40v40h-40zM316 390h40v40h-40zM396 310h40v40h-40z" />
      </svg>
      <span className="text-lm leading-normal mt-0 mb-2 text-whit e">
        {new Date(project.startDate).toLocaleDateString()}
      </span>
      {project.endDate && (
        <>
          <span className="text-white font-bold mx-4">{">"}</span>
          <span className="text-sm leading-normal mt-0 mb-2 text-white">
            {new Date(project.endDate).toLocaleDateString()}
          </span>
        </>
      )}
    </div>
  );
};

const Projeto = ({ project }) => {
  const photos = project.gallery.map((p) => {
    return {
      id: p.id,
      src: p.url,
      height: p.height,
      width: p.width,
    };
  });

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };
  return (
    <Layout>
      <SEO title={project.name} />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill my-auto flex items-center justify-center"
        style={
          project.media
            ? {
                width: "100%",
                height: "52vh",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundImage: `url(${project.media.url})`,
              }
            : {
                width: "100%",
                height: "52vh",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundImage: `url('/projetos.webp')`,
              }
        }
      >
        <div className="container mx-auto flex flex-col items-center" style={{ maxWidth: "768px"}}>
          <h1 className="text-4xl font-bold mb-4" 
            style={{
              textShadow: "2px 2px 20px #000000, 0 0 15px #000000"
              }}>
              {project.name}
            </h1>
        </div>
      </div>
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label={project.name}
            slug={project.slug}
            routes={["/", "/projetos", project.slug]}
          />
        </div>
      </div>
      <section>
        <div className="container mx-auto mt-8 mb-8">
          <div className="bg-ameciclo text-white flex lg:mx-0 mx-auto flex-wrap rounded p-16 my-auto flex items-center justify-center">
            <div className="lg:pr-5 w-full lg:w-1/2 mb-4 lg:mb-0">
              <p className="text-lg lg:text-3xl" style={{textTransform: 'uppercase'}}>
                {project.goal}
              </p>
            </div>
            <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
              <div className="text-xs lg:text-base text-white mb-2 tracking-wide">
                {(project.startDate || project.endDate) && (
                  <ProjectDate project={project} />
                )}
              </div>
              <div className="mt-6 w-full flex justify-center lg:pt-4 pt-4 lg:flex-row flex-col items-center" style={{textTransform: 'uppercase'}}>
                <div className="mr-4 p-3 text-center">
                  <Tippy content="A disseminação da bicicleta como uma mudança social e a busca pela humanização e a sustentabilidade">
                    <span className="text-xs lg:text-base text-white mb-2 tracking-wide">
                      Cultura da Bicicleta
                    </span>
                  </Tippy>
                  <span className="text-blue-400">
                    <Rating rating={project.bikeCulture} />
                  </span>
                </div>
                <div className="mr-4 p-3 text-center">
                  <Tippy content="Para transformar a cidade, a sociedade tem que estar junta e interligada nas pautas de luta">
                    <span className="text-xs lg:text-base text-white mb-2 tracking-wide">
                      Articulação Institucional
                    </span>
                  </Tippy>
                  <span className="text-yellow-400">
                    <Rating rating={project.instArticulation} />
                  </span>
                </div>
                <div className="lg:mr-4 p-3 text-center">
                  <Tippy content="Os ambientes democráticos são espaços permanentes de lutas para construir a cidade">
                    <span className="text-xs lg:text-base text-white mb-2 tracking-wide">
                      Incidência Política
                    </span>
                  </Tippy>
                  <span className="text-red-400">
                    <Rating rating={project.politicIncidence} />
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center mt-6">
                {project.Links.map((link) => {
                  return (
                    <a href={link.link}>
                      <button
                        className="bg-transparent border-2 border-white uppercase text-white font-bold hover:bg-white hover:text-ameciclo shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-2 mx-2"
                        type="button"
                        style={{ transition: "all .15s ease" }}
                      >
                        {link.title}
                      </button>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="container my-12 mx-auto">
        <div className="flex flex-col bg-white mb-6 shadow-xl rounded-lg">
          <div className="container mx-auto flex justify-center">
            { project.steps.length > 0 && (
            <div className="mx-auto grid md:grid-flow-col gap-6">
              {project.steps.map((p) => (
                  <StepCard step={p} key={p.id} />
                ))}
            </div> )}
          </div>
          <div className="mt-10 py-10 border-t border-gray-300 text-center">
            <div className="flex flex-wrap justify-center">
              <div className="w-full lg:w-9/12 px-4">
                <p className="mb-4 text-lg leading-relaxed text-gray-800">
                  <ReactMarkdown children={project.long_description} />
                </p>
              </div>
            </div>
          </div>
          
          {project.gallery ? (
            <>
              <PhotoGallery photos={photos} onClick={openLightbox} />
              <ModalGateway>
                {viewerIsOpen ? (
                  <Modal onClose={closeLightbox}>
                    <Carousel
                      currentIndex={currentImage}
                      views={photos.map((x) => ({
                        ...x,
                        srcset: x.srcSet,
                        caption: x.title,
                      }))}
                    />
                  </Modal>
                ) : null}
              </ModalGateway>
            </>
          ) : null}
        </div>
        <div className="container mx-auto flex mx-4 pt-10 justify-center border-gray-300 ">
          {project.partners.length > 0 && (
              <div className="grid md:grid-flow-col gap-10">
              { project.partners.map((p) => (
                  <PartnerCard partner={p} key={p.id} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticPaths() {
  //const res = await fetch("https://cms.ameciclo.org/projects");
  const res = await fetch("http://localhost:1337/projects");

  const projects = await res.json();

  // Get the paths we want to pre-render based on posts
  const paths = projects.map((p) => ({
    params: { project: p.slug },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    //`https://cms.ameciclo.org/projects?slug=${params.project}`
    `http://localhost:1337/projects?slug=${params.project}`

  );
  const project = await res.json();
  return {
    props: {
      project: project[0],
    },
    revalidate: 1,
  };
}

export default Projeto;
