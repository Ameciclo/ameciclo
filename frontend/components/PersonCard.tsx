import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";

export const PersonCard = ({ person }) => {
    const [showBioModal, setShowBioModal] = useState(false);
  
    const toggleBioModal = () => {
      setShowBioModal(!showBioModal);
    };
  
    const closeModalOutsideClick = (e) => {
      if (showBioModal && !e.target.closest('.bio-modal')) {
        toggleBioModal();
      }
    };
  
    useEffect(() => {
      document.addEventListener('mousedown', closeModalOutsideClick);
      return () => {
        document.removeEventListener('mousedown', closeModalOutsideClick);
      };
    }, [showBioModal]);
  
    return (
      <div className="max-w-sm p-4 relative">
        <div
          className="bg-white  overflow-hidden cursor-pointer"
          onClick={toggleBioModal}
        >
          {!showBioModal && (
            <button
              className="absolute right-5 text-white shadow-lg hover: bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-ameciclo z-10 rounded-full "
              onClick={(e) => {
                e.stopPropagation();
                toggleBioModal();
              }}
            >
              <Image
              src={"/../public/apple-icon-57x57.png"}
              alt={person.name}
              width={50}
              height={50}
              className="rounded-full"

            />
            </button>
          )}
          <div className="p-6">
            <Image
              src={person.media.url}
              alt={person.name}
              width={352}
              height={270}
              className="w-full h-full transition duration-300 filter hover:contrast-150"
            />
            <h2 className="text-2xl  text-gray-900 text-center">{person.name}</h2>
          </div>
        </div>
        {showBioModal && (
          <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black bg-opacity-75 z-40">
            <div className="max-w-5xl p-6 bg-white rounded-sm shadow-sm mr-5 relative">
            <button
                className="absolute top-2 right-2 px-4 py-2 bg-ameciclo text-white rounded-lg shadow-lg hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-ameciclo"
                onClick={toggleBioModal}
              >
                X
              </button>
              <div className="flex space-x-8 space-y-8">
                <Image
                  src={person.media.url}
                  alt={person.name}
                  width={352}
                  height={270}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
                  <p className="text-gray-600 max-w-sm">{person.bio}</p>
                </div>
              </div>
            </div>   
          </div>
        )}
      </div>
    );
  };