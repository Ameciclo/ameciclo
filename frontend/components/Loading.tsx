import React from "react";
import Header from "./Header";
import { Footer } from "./Footer";
import Image from "next/image";

const Loading = () => {
  return (
    <>
      <div className="flex flex-col justify-between h-screen font-sans text-gray-900">
        <Header />
        <div className='flex flex-col w-full h-full items-center justify-end bg-ameciclo'>
          <div className='animate-bounce w-40 h-40 xl:w-96 xl:h-96  '>
            <Image
              src="/android-icon-192x192.png"
              layout="fill"
              alt="icone ameciclo girando em torno do proprio eixo infinitamente"
              className='rounded-full'
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Loading;
