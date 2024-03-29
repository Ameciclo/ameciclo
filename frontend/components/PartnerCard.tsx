import React from "react";
import Link from "next/link";
import Image from "next/image";
import Tippy from "@tippyjs/react";

export const PartnerCard = ({ partner }) => {
  return (
    <Tippy content={`${partner.name}`}>
      <div className="p-2 bg-white rounded-lg shadow">
        {partner.logo ? (
          <Link href={`${partner.url}`} passHref>
            <div
              style={{
                backgroundImage: `url(${partner.logo.url})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                position: "relative",
                minHeight: "140px",
                minWidth: "140px",
                cursor: "pointer",
              }}
            />
          </Link>
        ) : (
          <div
            style={{
              minHeight: "140px",
            }}
          />
        )}
      </div>
    </Tippy>
  );
};
