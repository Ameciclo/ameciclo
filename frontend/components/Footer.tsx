import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";

export const Footer = ({ footer }) => {
  const addressLink = "https://maps.google.com/?q=" + footer.address;
  const emailLink = "mailto:" + footer.email;
  const phoneLink = "https://api.whatsapp.com/send?phone=" + footer.phone;

  return (
    <>
      <footer className="bg-gray-100">
        <div className="container mx-auto px-6 pt-10 pb-6">
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/3 text-center md:text-left">
              <h5 className="uppercase mb-6 font-bold">Ameciclo</h5>
              <ul className="mb-4">
                <li className="mt-2">
                  <p className="hover:underline text-gray-600 hover:text-red-600">
                    {footer.name}
                  </p>
                </li>
                <li className="mt-2">
                  <a
                    href={phoneLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-gray-600 hover:text-red-600"
                  >
                    {footer.phone}
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    className="hover:underline text-gray-600 hover:text-red-600"
                    href={addressLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {footer.address}
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={emailLink}
                    className="hover:underline text-gray-600 hover:text-red-600"
                  >
                    {footer.email}
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/3 text-center">
              <h5 className="uppercase mb-6 font-bold">Links</h5>
              <ul className="mb-4">
                {footer.links.map((l) => (
                  <li className="mt-2">
                    <Link href={l.link}>
                      <a className="hover:underline text-gray-600 hover:text-red-600">
                        {l.title}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/3 text-center">
              <h5 className="uppercase mb-6 font-bold">Social</h5>
              <ul className="mb-4">
                {footer.socialmedia.map((s) => (
                  <li className="mt-2">
                    <Link href={s.link}>
                      <a className="hover:underline text-gray-600 hover:text-red-600">
                        {s.title}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

Footer.propTypes = {
  footer: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    links: PropTypes.arrayOf(PropTypes.object),
    socialmedia: PropTypes.arrayOf(PropTypes.object),
  }),
};

Footer.defaultProps = {
  footer: {
    name: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
    address: "R. da Aurora, 529, loja 2 - Santo Amaro, Recife/PE, 50050-145",
    phone: "+55 (81) 9 9458-6830",
    email: "contato@ameciclo.org",
    links: [
      {
        title: "FAQ",
        link: "/biciclopedia",
      },
      {
        title: "Wiki",
        link: "https://biciclopedia.miraheze.org/",
      },
      {
        title: "Plataforma de Dados",
        link: "https://dados.ameciclo.org",
      },
    ],
    socialmedia: [
      {
        title: "Facebook",
        link: "https://facebook.com/ameciclo",
      },
      {
        title: "Instagram",
        link: "https://instagram.com/ameciclo",
      },
      {
        title: "Twitter",
        link: "https://twitter.com/ameciclo",
      },
      {
        title: "Youtube",
        link: "https://www.youtube.com/user/ameciclo",
      },
      {
        title: "Telegram",
        link: "https://t.me/s/ameciclo",
      },
    ],
  },
};
