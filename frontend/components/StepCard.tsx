import React from "react";
import Link from "next/link";
import Image from "next/image";

export const StepCard = ({ step }) => {
  return (
    <div className="bg-white rounded-lg shadow " style={{ minHeight: "380px" }}>
      {step.image ? (
        <Link href={`${step.link}`}>
          <div
            style={{
              backgroundImage: `url(${step.image.url})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              position: "relative",
              minHeight: "200px",
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
            <dt className="mt-1 text-2xl font-semibold leading-9 text-gray-900 cursor-pointer">
              {step.title}
            </dt>
          </Link>
          <dt
            className="text-sm text-gray-600"
            style={{
              maxHeight: "80px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {step.description}
          </dt>
        </dl>
      </div>
    </div>
  );
};
