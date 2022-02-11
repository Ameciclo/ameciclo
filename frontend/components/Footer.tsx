import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <>
      <footer className="bg-gray-100">
        <div className="container px-6 pt-10 pb-6 mx-auto">
          <div className="flex flex-wrap">
            <div className="w-full text-center md:w-1/4 md:text-left">
              <h5 className="mb-6 font-bold uppercase">Ameciclo</h5>
              <ul className="mb-4">
                <li className="mt-2">
                  <p className="text-gray-600 hover:underline hover:text-red-600">
                    Ameciclo - Associação Metropolitana de Ciclistas do Recife
                  </p>
                </li>
                <li className="mt-2">
                  <a
                    href="https://api.whatsapp.com/send?phone=5581994586830"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    +55 (81) 9 9458-6830
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    className="text-gray-600 hover:underline hover:text-red-600"
                    href="https://bit.ly/2C01AhY"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    R. da Aurora, 529, loja 2 - Santo Amaro, Recife/PE,
                    50050-145
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="mailto:contato@ameciclo.org"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    contato@ameciclo.org
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full text-center md:w-1/4">
              <h5 className="mb-6 font-bold uppercase">Links</h5>
              <ul className="mb-4">
                <li className="mt-2">
                  <Link href="/biciclopedia">
                    <a className="text-gray-600 hover:underline hover:text-red-600">
                      FAQ
                    </a>
                  </Link>
                </li>
                <li className="mt-2">
                  <a
                    href="https://biciclopedia.miraheze.org/"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Wiki
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href="https://dados.ameciclo.org"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Plataforma de Dados
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full text-center md:w-1/4">
              <h5 className="mb-6 font-bold uppercase">Social</h5>
              <ul className="mb-4">
                <li className="mt-2">
                  <a
                    href="https://facebook.com/ameciclo"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Facebook
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href="https://instagram.com/ameciclo"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Instagram
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href="https://twitter.com/ameciclo"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Twitter
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href="https://www.youtube.com/user/ameciclo"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Youtube
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href="https://t.me/s/ameciclo"
                    className="text-gray-600 hover:underline hover:text-red-600"
                  >
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full text-center md:w-1/4">
              <h5 className="mb-6 font-bold uppercase">Apoio</h5>
              <ul className="mb-4">
                <li className="mt-2">
                  <a
                    href=" https://vercel.com/?utm_source=ameciclo&utm_campaign=oss"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/vercel-logo.svg"
                      alt="Vercel Logo"
                      width={212}
                      height={44}
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
