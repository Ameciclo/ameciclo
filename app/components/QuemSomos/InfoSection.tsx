import ReactMarkdown from "react-markdown";

interface InfoSectionProps {
  definition?: string;
  objective?: string;
  links?: Array<{ id: string; title: string; link: string }>;
}

export function InfoSection({ definition, objective, links }: InfoSectionProps) {
  return (
    <div className="flex flex-wrap p-16 mx-auto text-white rounded bg-ameciclo lg:mx-0">
      <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
        <div className="text-lg lg:text-3xl">
          <ReactMarkdown>{definition}</ReactMarkdown>
        </div>
      </div>
      <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
        <p className="mb-2 text-xs tracking-wide text-white lg:text-base">
          {objective}
        </p>
        <div className="flex flex-wrap items-start justify-start max-w-5xl mx-auto mt-8 lg:mt-0">
          {links?.map((l) => (
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
  );
}
