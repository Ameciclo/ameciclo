import React from "react";
import Header from "./Header";
import { Footer } from "./Footer";
import Image from "next/image";

const Loading = () => {
  return (
    <>
      <div className="flex flex-col justify-between h-screen font-sans text-gray-900">
        <Header />
        <div className=' flex flex-col w-full h-full items-center justify-end bg-ameciclo'>
          <Image
            src="/android-icon-192x192.png"
            alt="icone ameciclo girando em torno do proprio eixo infinitamente"
            className='animate-bounce rounded-full xl:w-96'
          />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Loading;
