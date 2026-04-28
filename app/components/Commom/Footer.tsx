import { Link } from "@remix-run/react";
import { footerColumn, footerColumnContent } from "../../../typings";

export const Footer = () => {
  const columns: footerColumn[] = [
    {
      title: "Ameciclo",
      align: "left",
      content: [
        {
          label: "Associação de Metropolitana de Ciclistas do Recife",
          url: "https://www.ameciclo.org",
        },
        {
          label: "+55 (81) 99786 0060",
          url: "https://api.whatsapp.com/send?phone=5581997860060",
        },
        {
          label: "R. da Aurora, 529, loja 2 - Santo Amaro, Recife/PE, 50050-145",
          url: "https://bit.ly/2C01AhY",
        },
        {
          label: "contato@ameciclo.org",
          url: "mailto:contato@ameciclo.org",
        },
      ],
      button: {
        label: "Entre em Contato",
        url: "/contato",
      },
    },
    {
      title: "Links",
      align: "center",
      content: [
        {
          label: "Dados",
          url: "/dados",
        },
        {
          label: "Documentação",
          url: "/documentacao",
        },
        {
          label: "Biciclopédia",
          url: "/biciclopedia",
        },
        {
          label: "API Garfo",
          url: "http://api.garfo.ameciclo.org",
        },
        {
          label: "CMS Strapi",
          url: "http://do.strapi.ameciclo.org",
        },
      ],
    },
    {
      title: "Social",
      align: "center",
      content: [
        {
          label: "Instagram",
          url: "https://instagram.com/ameciclo",
        },
        {
          label: "YouTube",
          url: "https://www.youtube.com/ameciclo",
        },
        {
          label: "Telegram",
          url: "https://t.me/ameciclo",
        },
        {
          label: "GitHub",
          url: "https://github.com/Ameciclo",
        },
      ],
    },
  ];

  return (
    <footer className="bg-gray-200 relative z-20">
      <div className="container mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-wrap">
          {columns.map((column: footerColumn, i: number) => (
            <div
              key={i}
              className={`w-full md:w-1/3 text-center md:text-${column.align || "center"}`}
            >
              <FooterColumn column={column} />
              {column.button && (
                <Link
                  to={column.button.url}
                  className="inline-block mt-4 px-4 py-2 text-sm border border-[#008080] text-[#008080] rounded hover:bg-[#008080] hover:text-white transition-colors"
                >
                  {column.button.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

interface FooterColumnProps {
  column: footerColumn;
}

function FooterColumn({ column }: FooterColumnProps) {
  return (
    <>
      <h5 className="uppercase mb-6 font-bold text-black">{column.title}</h5>
      <ul className="mb-4">
        {column.content.map((content: footerColumnContent, i: number) => (
          <li key={i} className="mt-2">
            <Link
              to={content.url}
              rel="noopener noreferrer"
              className="hover:underline text-gray-600 hover:text-red-600"
            >
              {content.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
