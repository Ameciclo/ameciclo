import { useEffect, useState } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export interface Service {
  category: string;
  name: string;
  url: string;
}

export interface ServiceStatus extends Service {
  status: "OK" | "OFF";
  httpStatus?: number;
  errorMessage?: string;
}

const servicesList: Service[] = [
  { category: "APIs", name: "API - STRAPI V3", url: "https://cms.ameciclo.org" },
  { category: "APIs", name: "API - STRAPI V4", url: "https://test.cms.ameciclo.org" },
  { category: "APIs", name: "API - STRAPI V5 [em breve...]", url: "https://do.strapi.ameciclo.org" },
  { category: "Páginas do Site", name: "Página Inicial", url: "/" },
  { category: "Páginas do Site", name: "Quem Somos", url: "/quem_somos" },
  { category: "Páginas do Site", name: "Agenda", url: "/agenda" },
  { category: "Páginas do Site", name: "Projetos", url: "/projetos" },
  { category: "Páginas do Site", name: "Projeto", url: "/projetos/nome_do_projeto" },
  { category: "Páginas do Site", name: "Contato", url: "/contato" },
  { category: "Páginas do Site", name: "Dados", url: "/dados" },
  { category: "Páginas do Site", name: "Contagens", url: "/dados/contagens" },
  { category: "Páginas do Site", name: "Documentos", url: "/dados/documentos" },
  { category: "Páginas do Site", name: "Ideciclo", url: "/dados/ideciclo" },
  { category: "Páginas do Site", name: "Observatório", url: "/dados/observatorio" },
  { category: "Páginas do Site", name: "Execução Cicloviária", url: "/dados/observatorio/execucaocicloviaria" },
  { category: "Páginas do Site", name: "Loa Clima", url: "/dados/observatorio/loa" },
  { category: "Páginas do Site", name: "Perfil", url: "/dados/observatorio/dom" },
  {
    category: "Serviços Externos",
    name: "Serviço - Associe-se",
    url: "https://www.docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform",
  },
  { category: "Serviços Externos", name: "Serviço - Participe", url: "https://participe.ameciclo.org" },
];

const statusMessages: Record<number, string> = {
  400: "Requisição mal formada.",
  401: "Não autorizado!",
  403: "Proibido!",
  404: "Recurso não encontrado...",
  500: "Erro interno no servidor.",
  502: "Erro de gateway.",
  503: "Serviço temporariamente indisponível.",
  504: "Timeout do gateway.",
};

const checkStatus = async (url: string): Promise<Omit<ServiceStatus, keyof Service> | {}> => {
  try {
    const response = await fetch(url, { headers: { "Accept-Charset": "utf-8" } });
    const statusMessage = statusMessages[response.status] || `Erro inesperado com status ${response.status}`;
    if (response.ok) {
      return { status: "OK" };
    } else {
      return {
        status: "OFF",
        httpStatus: response.status,
        errorMessage: statusMessage,
      };
    }
  } catch (error: any) {
    console.error(`Erro ao acessar ${url}:`, error);
    return {
      status: "OFF",
      errorMessage: error.message || "Erro desconhecido ao acessar o serviço."
    };
  }
};

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;

  const results: ServiceStatus[] = await Promise.all(
    servicesList.map(async (service) => {
      const fullUrl = service.url.startsWith("http") ? service.url : `${origin}${service.url}`;
      const statusData = await checkStatus(fullUrl);
      return { ...service, ...statusData } as ServiceStatus;
    })
  );

  return json(results, {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default function StatusPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [fontSize, setFontSize] = useState<number>(16);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setServices(loaderData);
    setLoading(false);
  }, [loaderData]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setDarkMode(true);
    } else if (stored === "light") {
      setDarkMode(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const categories = Array.from(new Set(services.map((service) => service.category)));

  return (
    <div className={`p-6 transition-colors duration-300 ${darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"}`}>
      <h1 className="text-5xl mb-5">Status dos Serviços</h1>
      <a className="underline font-blue" href="/documentacao">leia a documentação</a>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="p-2 bg-gray-200 dark:bg-zinc-700 dark:text-white" onClick={() => setFontSize(fontSize + 2)}>A+</button>
        <button className="p-2 bg-gray-200 dark:bg-zinc-700 dark:text-white" onClick={() => setFontSize(fontSize - 2)}>A-</button>
        <button className="p-2 bg-gray-200 dark:bg-zinc-700 dark:text-white" onClick={() => setDarkMode(!darkMode)}>
          Mudar para modo {darkMode ? "claro" : "escuro"}
        </button>
      </div>

      {loading ? (
        <p className="text-xl">Verificando status dos serviços <span className="dot"> . . . </span></p>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-6">
            <h2 className="text-2xl pt-5 font-semibold mb-3" style={{ fontSize }}>{category}</h2>
            {services
              .filter((service) => service.category === category)
              .map((service, index) => (
                <div key={index} className="mb-3" style={{ fontSize }}>
                  <p>
                    <span className={service.status === "OK" ? "text-green-500" : "text-red-500"}>
                      <strong>[{service.status}]</strong>
                    </span>{" "}
                    <strong>{service.name}:</strong>{" "}
                    <span className={service.status === "OK" ? "text-green-500 underline font-bold" : "text-red-300 underline"}>
                      <a href={service.url}>{service.url}</a>
                    </span>{" "}
                    {service.status === "OFF" && service.httpStatus && (
                      <span className="text-red-500">[{service.httpStatus}]</span>
                    )}
                    {service.status === "OFF" && service.errorMessage && (
                      <span className="text-red-500"> - {service.errorMessage}</span>
                    )}
                  </p>
                </div>
              ))}
          </div>
        ))
      )}
    </div>
  );
}