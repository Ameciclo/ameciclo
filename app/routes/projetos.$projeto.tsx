import { useLoaderData } from "@remix-run/react";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import ReactMarkdown from "react-markdown";
import { loader } from "../loader/projetos";

export { loader };

const ProjectDate = ({ project }: any) => {
  const dateOption: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  return (
    project.startDate && (
      <div className="flex flex-row justify-center">
        <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 512 512">
          <path d="M452 40h-24V0h-40v40H124V0H84v40H60C26.916 40 0 66.916 0 100v352c0 33.084 26.916 60 60 60h392c33.084 0 60-26.916 60-60V100c0-33.084-26.916-60-60-60zm20 412c0 11.028-8.972 20-20 20H60c-11.028 0-20-8.972-20-20V188h432v264zm0-304H40v-48c0-11.028 8.972-20 20-20h24v40h40V80h264v40h40V80h24c11.028 0 20 8.972 20 20v48z" />
          <path d="M76 230h40v40H76zM156 230h40v40h-40zM236 230h40v40h-40zM316 230h40v40h-40zM396 230h40v40h-40zM76 310h40v40H76zM156 310h40v40h-40zM236 310h40v40h-40zM316 310h40v40h-40zM76 390h40v40H76zM156 390h40v40h-40zM236 390h40v40h-40zM316 390h40v40h-40zM396 310h40v40h-40z" />
        </svg>
        <span className="mt-0 mb-2 leading-normal text-white">
          {new Date(project.startDate)
            .toLocaleDateString("pt-br", dateOption)
            .toUpperCase()}
        </span>
        <span className="mx-4 font-bold text-white">a</span>
        <span className="mt-0 mb-2 leading-normal text-white">
          {project.endDate
            ? new Date(project.endDate)
                .toLocaleDateString("pt-br", dateOption)
                .toUpperCase()
            : "HOJE"}
        </span>
      </div>
    )
  );
};

const Rating = ({ rating }: { rating: string }) => {
  const ratingMap = new Map([
    ["high", { value: 3, color: "#6CAF56", fontColor: "#dbf4c6" }],
    ["low", { value: 1, color: "#E8E288", fontColor: "#615f46" }],
    ["medium", { value: 2, color: "#FF8360", fontColor: "#581f0f" }],
  ]);
  
  const ratingData = ratingMap.get(rating) || { value: 0, color: "#gray", fontColor: "#gray" };
  
  return (
    <div className="flex flex-row justify-center">
      {[...Array(ratingData.value)].map((e, i) => {
        return (
          <svg
            className="w-6 h-6 fill-current m-1"
            viewBox="0 0 512 512"
            key={i}
            style={{ color: ratingData.color }}
          >
            <path d="M407.531 206.527a103.924 103.924 0 00-37.501 6.966c-9.124-20.276-17.007-41.719-20.944-61.668-6.323-32.038-34.634-55.291-67.318-55.291-8.284 0-15 6.716-15 15s6.716 15 15 15c3.569 0 7.044.498 10.355 1.423a38.81 38.81 0 0123.582 18.758 14.94 14.94 0 00-1.128 1.618l-4.66 7.845-23.576 39.69H160.377l-7.16-18.021h2.972c8.284 0 15-6.716 15-15s-6.716-15-15-15H104.47c-8.284 0-15 6.716-15 15s6.716 15 15 15h16.466l13.09 32.944a104.16 104.16 0 00-29.556-4.265C46.865 206.527 0 253.392 0 310.996s46.865 104.469 104.469 104.469c52.511 0 96.091-38.946 103.388-89.469h27.547a15 15 0 0012.896-7.339l78.827-132.706c4.624 14.31 10.412 28.648 16.651 42.346-24.747 19.122-40.716 49.079-40.716 82.7 0 57.604 46.865 104.469 104.469 104.469S512 368.601 512 310.997s-46.865-104.47-104.469-104.47zM104.469 325.996h72.951c-6.96 33.897-37.025 59.469-72.951 59.469C63.407 385.464 30 352.058 30 310.996s33.407-74.469 74.469-74.469c35.926 0 65.991 25.572 72.951 59.469h-72.951c-8.284 0-15 6.716-15 15s6.716 15 15 15zm122.398-30h-19.01c-3.481-24.099-15.216-45.561-32.241-61.421a15.004 15.004 0 00-.573-1.795l-2.746-6.911h96.225l-41.655 70.127zm180.664 89.468c-41.063 0-74.469-33.407-74.469-74.469 0-21.753 9.378-41.355 24.301-54.983 18.448 35.256 36.467 61.538 37.823 63.504 2.911 4.217 7.594 6.48 12.358 6.48 2.938 0 5.907-.862 8.508-2.657 6.818-4.706 8.53-14.048 3.824-20.866-.323-.468-18.475-26.939-36.652-61.853a74.112 74.112 0 0124.307-4.095c41.062 0 74.469 33.407 74.469 74.469s-33.407 74.47-74.469 74.47z" />
          </svg>
        );
      })}
      {[...Array(3 - ratingData.value)].map((e, i) => {
        return (
          <svg
            className="w-6 h-6 fill-current text-gray-300 m-1"
            viewBox="0 0 512 512"
            key={i}
          >
            <path d="M407.531 206.527a103.924 103.924 0 00-37.501 6.966c-9.124-20.276-17.007-41.719-20.944-61.668-6.323-32.038-34.634-55.291-67.318-55.291-8.284 0-15 6.716-15 15s6.716 15 15 15c3.569 0 7.044.498 10.355 1.423a38.81 38.81 0 0123.582 18.758 14.94 14.94 0 00-1.128 1.618l-4.66 7.845-23.576 39.69H160.377l-7.16-18.021h2.972c8.284 0 15-6.716 15-15s-6.716-15-15-15H104.47c-8.284 0-15 6.716-15 15s6.716 15 15 15h16.466l13.09 32.944a104.16 104.16 0 00-29.556-4.265C46.865 206.527 0 253.392 0 310.996s46.865 104.469 104.469 104.469c52.511 0 96.091-38.946 103.388-89.469h27.547a15 15 0 0012.896-7.339l78.827-132.706c4.624 14.31 10.412 28.648 16.651 42.346-24.747 19.122-40.716 49.079-40.716 82.7 0 57.604 46.865 104.469 104.469 104.469S512 368.601 512 310.997s-46.865-104.47-104.469-104.47zM104.469 325.996h72.951c-6.96 33.897-37.025 59.469-72.951 59.469C63.407 385.464 30 352.058 30 310.996s33.407-74.469 74.469-74.469c35.926 0 65.991 25.572 72.951 59.469h-72.951c-8.284 0-15 6.716-15 15s6.716 15 15 15zm122.398-30h-19.01c-3.481-24.099-15.216-45.561-32.241-61.421a15.004 15.004 0 00-.573-1.795l-2.746-6.911h96.225l-41.655 70.127zm180.664 89.468c-41.063 0-74.469-33.407-74.469-74.469 0-21.753 9.378-41.355 24.301-54.983 18.448 35.256 36.467 61.538 37.823 63.504 2.911 4.217 7.594 6.48 12.358 6.48 2.938 0 5.907-.862 8.508-2.657 6.818-4.706 8.53-14.048 3.824-20.866-.323-.468-18.475-26.939-36.652-61.853a74.112 74.112 0 0124.307-4.095c41.062 0 74.469 33.407 74.469 74.469s-33.407 74.47-74.469 74.47z" />
          </svg>
        );
      })}
    </div>
  );
};

const StepCard = ({ step }: any) => (
  <div
    className="bg-white rounded-lg shadow"
    style={{ minHeight: "380px", maxWidth: "300px" }}
  >
    {step.image ? (
      <div
        style={{
          backgroundImage: `url(${step.image.url})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          position: "relative",
          minHeight: "200px",
          minWidth: "200px",
          cursor: "pointer",
        }}
      />
    ) : (
      <div style={{ minHeight: "200px" }} />
    )}
    <div className="px-4 py-5 lg:p-6">
      <dl className="pb-6">
        <dt className="mt-1 text-2xl font-semibold leading-9 text-gray-900 cursor-pointer">
          {step.title}
        </dt>
        <dt
          className="text-sm text-gray-600"
          style={{
            maxHeight: "80px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
          }}
        >
          {step.description}
        </dt>
      </dl>
    </div>
  </div>
);

export default function Projeto() {
    const { project } = useLoaderData<any>();
    
    const flagRegex = /^(?:\uD83C[\uDDE6-\uDDFF]){2}$/;
    const flagLinks = project?.Links?.filter((link: any) => flagRegex.test(link.title)) || [];
    const otherLinks = project?.Links?.filter((link: any) => !flagRegex.test(link.title)) || [];
    
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
                        color: #1f2937;
                        font-weight: 600;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                    }
                    .markdown-content h1 { font-size: 2.25rem; }
                    .markdown-content h2 { font-size: 1.875rem; }
                    .markdown-content h3 { font-size: 1.5rem; }
                    .markdown-content h4 { font-size: 1.25rem; }
                    .markdown-content p {
                        margin-bottom: 1.2em;
                        line-height: 1.8;
                        text-align: justify;
                    }
                    .markdown-content ul, .markdown-content ol {
                        margin: 1.2em 0;
                        padding-left: 2em;
                    }
                    .markdown-content li {
                        margin-bottom: 0.8em;
                        line-height: 1.7;
                    }
                    .markdown-content strong {
                        font-weight: 600;
                        color: #111827;
                    }
                    .markdown-content em {
                        font-style: italic;
                    }
                    .markdown-content blockquote {
                        border-left: 4px solid #e5e7eb;
                        padding-left: 1.5em;
                        margin: 1.5em 0;
                        font-style: italic;
                        color: #6b7280;
                        background-color: #f9fafb;
                        padding: 1em 1.5em;
                        border-radius: 0.375rem;
                    }
                    .markdown-content a {
                        color: #dc2626;
                        text-decoration: underline;
                    }
                    .markdown-content a:hover {
                        color: #b91c1c;
                    }
                `
            }} />
            <div
                className="flex items-center justify-center object-fill h-auto px-10 py-24 my-auto text-white bg-center bg-cover"
                style={{
                    width: "100%",
                    height: "52vh",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url(${project?.cover?.url || project?.media?.url || '/projetos.webp'})`,
                }}
            >
                {project?.showTitle !== false && (
                    <div className="container flex flex-col items-center mx-auto" style={{ maxWidth: "768px" }}>
                        <h1
                            className="text-4xl font-bold"
                            style={{
                                textShadow: "2px 2px 20px #000000, 0 0 15px #000000",
                            }}
                        >
                            {project?.name}
                        </h1>
                    </div>
                )}
            </div>

            <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
                <div className="container mx-auto">
                    <Breadcrumb
                        label={project?.name || "Projeto"}
                        slug={project?.slug || ""}
                        routes={["/", "/projetos"]}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-center mt-6">
                {flagLinks.map((link: any) => (
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
                                {project?.goal}
                            </p>
                        </div>
                        <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
                            <div className="mb-2 text-xs tracking-wide text-white lg:text-base">
                                {(project?.startDate || project?.endDate) && (
                                    <ProjectDate project={project} />
                                )}
                            </div>
                            <div
                                className="flex flex-col items-center justify-center w-full pt-4 mt-6 lg:pt-4 lg:flex-row"
                                style={{ textTransform: "uppercase" }}
                            >
                                <div className="p-3 mr-4 text-center">
                                    <span className="mb-2 text-xs tracking-wide text-white lg:text-base">
                                        Cultura da Bicicleta
                                    </span>
                                    <Rating rating={project?.bikeCulture || "low"} />
                                </div>
                                <div className="p-3 mr-4 text-center">
                                    <span className="mb-2 text-xs tracking-wide text-white lg:text-base">
                                        Articulação Institucional
                                    </span>
                                    <Rating rating={project?.instArticulation || "low"} />
                                </div>
                                <div className="p-3 text-center lg:mr-4">
                                    <span className="mb-2 text-xs tracking-wide text-white lg:text-base">
                                        Incidência Política
                                    </span>
                                    <Rating rating={project?.politicIncidence || "low"} />
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center mt-6">
                                {otherLinks.map((link: any) => (
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
                    {project?.steps && project.steps.length > 0 && (
                        <div className="container flex justify-center mx-auto">
                            <div className="grid gap-6 mx-auto my-4 md:grid-flow-col">
                                {project.steps.map((step: any) => (
                                    <StepCard step={step} key={step.id} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="py-6 text-center">
                        <div className="flex flex-wrap justify-center">
                            <div className="w-full px-4 mb-4 text-lg leading-relaxed text-justify text-gray-800 lg:w-7/12">
                                <div className="markdown-content">
                                    {project?.long_description ? (
                                        <ReactMarkdown>{project.long_description}</ReactMarkdown>
                                    ) : (
                                        <p>{project?.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {project?.gallery && project.gallery.length > 0 && (
                        <div className="px-4 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.gallery.map((photo: any, index: number) => (
                                    <div key={photo.id || index} className="aspect-square">
                                        <img
                                            src={photo.url}
                                            alt={photo.caption || `Galeria ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {project?.products && project.products.length > 0 && (
                    <div className="container p-12 mx-auto my-10 overflow-auto bg-gray-100 rounded shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {project.products.map((product: any, index: number) => (
                                        <tr key={product.id || index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {product.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="container flex justify-center pt-10 mx-4 mx-auto">
                    {project?.partners && project.partners.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-10">
                            {project.partners.map((partner: any) => (
                                <div key={partner.id} className="flex items-center justify-center p-4 bg-white rounded-lg shadow">
                                    {partner.logo?.url ? (
                                        <img
                                            src={partner.logo.url}
                                            alt={partner.name}
                                            className="max-h-16 max-w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-600">{partner.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {project?.sponsors && project.sponsors.length > 0 && (
                    <div className="container mx-auto mt-10 mb-10">
                        <h3 className="text-2xl font-bold text-center mb-6">Patrocinadores</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                            {project.sponsors.map((sponsor: any) => (
                                <div key={sponsor.id} className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                    {sponsor.logo?.url ? (
                                        <img
                                            src={sponsor.logo.url}
                                            alt={sponsor.name}
                                            className="max-h-12 max-w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-600 text-center">{sponsor.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}