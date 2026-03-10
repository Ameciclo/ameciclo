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
          label:
            "R. da Aurora, 529, loja 2 - Santo Amaro, Recife/PE, 50050-145",
          url: "https://www.google.com/maps/place/Ameciclo/@-8.0593531,-34.8803879,19z/data=!4m12!1m5!3m4!2zOMKwMDMnMzMuNSJTIDM0wrA1Mic1Ny42Ilc!8m2!3d-8.0593056!4d-34.8826667!3m5!1s0x7ab18578298db9d:0xb5de9fc1b3a78f7f!8m2!3d-8.0593077!4d-34.8800935!16s%2Fg%2F11c1v0rrc2?entry=ttu&g_ep=EgoyMDI2MDMwOC4wIKXMDSoASAFQAw%3D%3D",
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
          label: "Projetos",
          url: "/projetos",
        },
        {
          label: "Documentação",
          url: "/documentacao",
        },
        {
          label: "Biciclopedia (FAQ)",
          url: "/biciclopedia",
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
          label: "Telegram",
          url: "https://t.me/s/ameciclo",
        },
        {
          label: "Youtube",
          url: "https://www.youtube.com/ameciclo",
        },
        {
          label: "Facebook",
          url: "https://facebook.com/ameciclo",
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
              className={`w-full md:w-1/3 text-center md:text-${
                column.align || "center"
              }`}
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
