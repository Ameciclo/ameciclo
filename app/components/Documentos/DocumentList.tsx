import React from "react";
import { Link } from "@tanstack/react-router";
import type { DocumentEntry } from "~/queries/dados.documentos";

interface DocTypeIndicator {
  value: string;
  label: string;
  color: string;
  fontColor: string;
}

interface DocumentsListProps {
  documents: DocumentEntry[];
  docTypes: DocTypeIndicator[];
  searchTerm: string;
}

const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm) return text;

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded-sm">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

export const DocumentsList = ({ documents, docTypes, searchTerm }: DocumentsListProps) => {
  return (
    <div className="mt-5 mx-3 px-10 shadow-sm border grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3  auto-cols-max lg:grid-cols-4 gap-10">
      {documents.map((document) => {
        const indicator = docTypes.find((d) => document.type === d.value);
        return (
          <DocumentCard
            key={document.id}
            document={document}
            indicator={indicator}
            searchTerm={searchTerm}
          />
        );
      })}
    </div>
  );
};

interface ImageWithLinkProps {
  url: string;
  alt: string;
  src: string;
  aspectRatio?: number;
  width?: number;
  target?: "_blank" | "_self";
}

export function ImageWithLink({
  url,
  alt,
  src,
  aspectRatio = 16 / 9,
  width = 400,
  target = "_blank",
}: ImageWithLinkProps) {
  return (
    <Link to={url} target={target}>
      <div className="relative h-0" style={{ paddingBottom: `${100 / aspectRatio}%` }}>
        <img
          className="absolute top-0 left-0 w-full h-full"
          alt={alt}
          src={src}
          width={width}
          height={width / aspectRatio}
        />
      </div>
    </Link>
  );
}

interface DocumentCardProps {
  document: DocumentEntry;
  indicator: DocTypeIndicator | undefined;
  searchTerm: string;
}

const DocumentCard = ({ document, indicator, searchTerm }: DocumentCardProps) => {
  const coverUrl = document.cover?.url;
  const coverAlt =
    document.cover?.alternativeText || document.title || "Capa do documento";

  return (
    <div
      className="bg-white relative rounded-lg border"
      style={{ minHeight: "450px", maxWidth: "220" }}
    >
      {indicator && indicator.label !== "" ? (
        <div className=" absolute top-0 left-0 z-10">
          <DocumentTypeIndicator {...indicator} />
        </div>
      ) : null}
      {coverUrl ? (
        <div>
          <ImageWithLink
            url={document.url ?? "#"}
            alt={coverAlt}
            src={coverUrl}
            aspectRatio={0.75}
          />
        </div>
      ) : (
        <div style={{ minHeight: "270px" }} />
      )}
      <DocumentDescription document={document} searchTerm={searchTerm} />
    </div>
  );
};

const DocumentTypeIndicator = ({ label, color, fontColor }: DocTypeIndicator) => {
  return (
    <div
      className="uppercase p-2 rounded-sm bg-green-400 text-base font-semibold truncate"
      style={{
        maxHeight: "50px",
        color: fontColor,
        backgroundColor: color,
        borderRadius: "0 0 15px 0",
        borderBottom: "0 none",
        boxShadow: "0 1px 5px rgba(0, 0, 0, 0.46)",
      }}
    >
      {label}
    </div>
  );
};

interface DocumentDescriptionProps {
  document: DocumentEntry;
  searchTerm: string;
}

const DocumentDescription = ({ document, searchTerm }: DocumentDescriptionProps) => {
  const releaseYear = document.release_date?.slice(0, 4) ?? "";
  return (
    <div className="px-4 py-5 lg:p-6">
      <dl className="pb-6">
        <Link to={document.url ?? "#"}>
          <dt className="mt-1 text-2xl font-semibold leading-9 text-gray-900 cursor-pointer">
            {highlightText(document.title ?? "", searchTerm)}
            {releaseYear ? ` (${releaseYear})` : ""}
          </dt>
        </Link>
        <dt
          className="text-sm text-gray-600"
          style={{
            maxHeight: "100px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
          }}
        >
          {highlightText(document.description ?? "", searchTerm)}
        </dt>
      </dl>
    </div>
  );
};
