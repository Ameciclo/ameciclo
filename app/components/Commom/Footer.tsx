import { Link } from "@remix-run/react";
import { footerColumn, footerColumnContent } from "../../../typings";

export const Footer = () => {
  const columns = [
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
    },
    {
      title: "Links",
      align: "center",
      content: [
        {
          label: "Documentação",
          url: "/documentacao",
        },
        {
          label: "Status de Serviços",
          url: "/status",
        }
      ],
    },
    {
      title: "Social",
      align: "center",
      content: [
        {
          label: "Facebook",
          url: "https://facebook.com/ameciclo",
        },
        {
          label: "Instagram",
          url: "https://instagram.com/ameciclo",
        },
        {
          label: "Twitter",
          url: "https://twitter.com/ameciclo",
        },
        {
          label: "Telegram",
          url: "https://t.me/s/ameciclo",
        },
        {
          label: "Youtube",
          url: "https://www.youtube.com/ameciclo",
        },
      ],
    },
  ];

  return (
    <footer className="bg-gray-200">
      <div className="container mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-wrap">
          {columns.map((column: footerColumn, i: number) => (
            <div
              key={i}
              className={`w-full md:w-1/3 text-center md:text-${column.align || "center"}`}
            >
              <FooterColumn column={column} />
            </div>
          ))}
        </div>
        <div className="container p3">
          <VercelSponsor />
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
              target="_blank"
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

function VercelSponsor() {
  return (
    <Link
      to=" https://vercel.com/?utm_source=ameciclo&utm_campaign=oss"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/vercel_logo/vercel-logo.svg"
        alt="Vercel Logo"
        width={212}
        height={44}
        className="mx-auto"
      />
    </Link>
  );
}
