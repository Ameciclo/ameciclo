import React from "react";
import Link from "next/link";

export const Footer = ({ footer }) => {
  const addresslink = "https://maps.google.com/?q=" + footer.address;
  const emaillink = "mailto:" + footer.email;
  const phonelink = "https://api.whatsapp.com/send?phone=" + footer.phone

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
                    href={phonelink}
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
                    href={addresslink}
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
                    href={emaillink}
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