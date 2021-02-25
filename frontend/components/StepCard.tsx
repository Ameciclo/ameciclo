import React from "react";
import Link from "next/link";
import Image from "next/image";

export const StepCard = ({ step }) => {
  return (
    <div className="bg-white rounded-lg shadow " style={{ minHeight: "450px" }}>
      {step.image ? (
        <Link href={`${step.link}`}>
          <div
            style={{
              backgroundImage: `url(${step.image.url})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              position: "relative",
              minHeight: "270px",
              cursor: "pointer",
            }}
          />
        </Link>
      ) : (
        <div
          style={{
            minHeight: "270px",
          }}
        />
      )}
      <div className="px-4 py-5 lg:p-6">
        <dl className="pb-6">
          <Link href={`${step.link}`}>
            <dt className="mt-1 text-3xl font-semibold leading-9 text-gray-900 cursor-pointer">
              {step.name}
            </dt>
          </Link>
          <dt
            className="text-sm text-gray-600"
            style={{
              //maxHeight: "100px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {step.title}
            {step.description}
          </dt>
        </dl>
      </div>
    </div>
  );
};
