import { useCallback, useState } from "react";
import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import Breadcrumb from "../../components/Breadcrumb";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import Carousel, { Modal, ModalGateway } from "react-images";
import { Rating } from "../../components/Rating";
import { StepCard } from "../../components/StepCard";
import ReactMarkdown from "react-markdown";
import { PartnerCard } from "../../components/PartnerCard";
import { server } from "../../config";
import { ProductsTable } from "../../components/ProductsTable";
import PhotoAlbum from "react-photo-album";

const ProjectDate = ({ project }) => {
  const dateOption: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  return (
    project.startDate && (
      <div className="flex flex-row justify-center">
        <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 512 512">
          <defs />
          <path d="M452 40h-24V0h-40v40H124V0H84v40H60C26.916 40 0 66.916 0 100v352c0 33.084 26.916 60 60 60h392c33.084 0 60-26.916 60-60V100c0-33.084-26.916-60-60-60zm20 412c0 11.028-8.972 20-20 20H60c-11.028 0-20-8.972-20-20V188h432v264zm0-304H40v-48c0-11.028 8.972-20 20-20h24v40h40V80h264v40h40V80h24c11.028 0 20 8.972 20 20v48z" />
          <path d="M76 230h40v40H76zM156 230h40v40h-40zM236 230h40v40h-40zM316 230h40v40h-40zM396 230h40v40h-40zM76 310h40v40H76zM156 310h40v40h-40zM236 310h40v40h-40zM316 310h40v40h-40zM76 390h40v40H76zM156 390h40v40h-40zM236 390h40v40h-40zM316 390h40v40h-40zM396 310h40v40h-40z" />
        </svg>
        <span className="mt-0 mb-2 leading-normal text-lm text-whit e">
          {new Date(project.startDate)
            .toLocaleDateString("pt-br", dateOption)
            .toUpperCase()}
        </span>
        <>
          <span className="mx-4 font-bold text-white">{"a"}</span>
          <span className="mt-0 mb-2 leading-normal text-white text-lm">
            {project.endDate
              ? new Date(project.endDate)
                  .toLocaleDateString("pt-br", dateOption)
                  .toUpperCase()
              : "HOJE"}
          </span>
        </>
      </div>
    )
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

  // Definir a expressão regular para detectar emojis de bandeira
  const flagRegex = /^(?:\uD83C[\uDDE6-\uDDFF]){2}$/;

  // Separar os links em flagLinks e otherLinks
  const flagLinks = project.Links.filter((link) => flagRegex.test(link.title));
  const otherLinks = project.Links.filter(
    (link) => !flagRegex.test(link.title)
  );

  return (
    <Layout>
      <SEO title={project.name} />
      <div
        className="flex items-center justify-center object-fill h-auto px-10 py-24 my-auto text-white bg-center bg-cover"
        style={
          project.media && project.cover
            ? {
                width: "100%",
                height: "52vh",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundImage: `url(${project.cover.url})`,
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
        {!project.showTitle ? null : (
          <div
            className="container flex flex-col items-center mx-auto"
            style={{ maxWidth: "768px" }}
          >
            <h1
              className="text-4xl font-bold"
              style={{
                textShadow: "2px 2px 20px #000000, 0 0 15px #000000",
              }}
            >
              {project.name}
            </h1>
          </div>
        )}
      </div>

      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb
            label={project.name}
            slug={project.slug}
            routes={["/", "/projetos", project.slug]}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center mt-6">
              {/* Renderizar os Flag Links primeiro com texto maior */}
              {flagLinks.map((link) => (
                <a href={link.link} key={link.id}>
                  <button
                    className="px-4 py-2 mx-2 mb-2 text-lg font-bold text-white uppercase bg-ameciclo rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                  >
                    {link.title}
                  </button>
                </a>
              ))}
            </div>
      <section>
        <div className="container mx-auto mt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center p-16 mx-auto my-auto text-white rounded bg-ameciclo lg:mx-0">
            <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
              <p
                className="text-lg lg:text-3xl"
                style={{ textTransform: "uppercase" }}
              >
                {project.goal}
              </p>
            </div>
            <div className="w-full mb-4 lg:w-1/2 lg:mb-0">

              <div className="mb-2 text-xs tracking-wide text-white lg:text-base">
                {(project.startDate || project.endDate) && (
                  <ProjectDate project={project} />
                )}
              </div>
              <div
                className="flex flex-col items-center justify-center w-full pt-4 mt-6 lg:pt-4 lg:flex-row"
                style={{ textTransform: "uppercase" }}
              >
                <div className="p-3 mr-4 text-center">
                  <Tippy content="A disseminação da bicicleta como uma mudança social e a busca pela humanização e a sustentabilidade">
                    <span className="mb-2 text-xs tracking-wide text-white lg:text-base">
                      Cultura da Bicicleta
                    </span>
                  </Tippy>
                  <span className="text-blue-400">
                    <Rating rating={project.bikeCulture} />
                  </span>
                </div>
                <div className="p-3 mr-4 text-center">
                  <Tippy content="Para transformar a cidade, a sociedade tem que estar junta e interligada nas pautas de luta">
                    <span className="mb-2 text-xs tracking-wide text-white lg:text-base">
                      Articulação Institucional
                    </span>
                  </Tippy>
                  <span className="text-yellow-400">
                    <Rating rating={project.instArticulation} />
                  </span>
                </div>
                <div className="p-3 text-center lg:mr-4">
                  <Tippy content="Os ambientes democráticos são espaços permanentes de lutas para construir a cidade">
                    <span className="mb-2 text-xs tracking-wide text-white lg:text-base">
                      Incidência Política
                    </span>
                  </Tippy>
                  <span className="text-red-400">
                    <Rating rating={project.politicIncidence} />
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center mt-6">
                {/* Renderizar os Other Links com texto padrão */}
                {otherLinks.map((link) => (
                  <a href={link.link} key={link.id}>
                    <button
                      className="px-4 py-2 mx-2 mb-2 text-xs font-bold text-white uppercase bg-transparent border-2 border-white rounded shadow outline-none hover:bg-white hover:text-ameciclo focus:outline-none sm:mr-2"
                      type="button"
                      style={{ transition: "all .15s ease" }}
                    >
                      {link.title}
                    </button>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto my-10">
        <div className="flex flex-col bg-white rounded-lg shadow-xl">
          {project.steps && project.steps.length > 0 && (
            <div className="container flex justify-center mx-auto">
              <div className="grid gap-6 mx-auto my-4 md:grid-flow-col">
                {project.steps.map((p) => (
                  <StepCard step={p} key={p.id} />
                ))}
              </div>
            </div>
          )}
          <div className="py-6 text-center">
            <div className="flex flex-wrap justify-center">
              <div className="w-full px-4 mb-4 text-lg leading-relaxed text-justify text-gray-800 lg:w-7/12 markdown_box">
                {project.long_description ? (
                  <ReactMarkdown>{project.long_description}</ReactMarkdown>
                ) : (
                  project.description
                )}
              </div>
            </div>
          </div>

          {project.gallery ? (
            <>
              <PhotoAlbum
                layout="masonry"
                photos={photos}
                targetRowHeight={100}
                onClick={openLightbox}
              />
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

        {project.products.length ? (
          <div className="container p-12 mx-auto my-10 overflow-auto bg-gray-100 rounded shadow-2xl">
            <ProductsTable data={project.products} />
          </div>
        ) : null}

        <div className="container flex justify-center pt-10 mx-4 mx-auto border-gray-300 ">
          {project.partners && project.partners.length > 0 && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-10">
              {project.partners.map((p) => (
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
  const res = await fetch(`${server}/projects`);

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
  const res = await fetch(`${server}/projects?slug=${params.project}`);
  const project = await res.json();
  return {
    props: {
      project: project[0],
    },
    revalidate: 1,
  };
}

export default Projeto;
