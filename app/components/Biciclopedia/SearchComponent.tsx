import React, { useState } from "react";
import { Link } from "@remix-run/react";
import { Highlight } from "react-highlighter-ts";
import type { FuseResult } from "fuse.js";
import { decodeHtmlEntities } from "../../services/htmlDecode";

interface FAQ {
  id: number;
  title: string;
  description: string;
  answer?: string;
}

interface SearchComponentProps {
  faqs: FAQ[];
}

export const SearchComponent = (props: SearchComponentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [results, setResults] = useState<FuseResult<FAQ>[]>([]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const Fuse = (await import("fuse.js")).default;
    const fuse = new Fuse(props.faqs, {
      shouldSort: true,
      keys: ["title", "description"],
      minMatchCharLength: 3,
      includeMatches: true,
      threshold: 0.3,
    });
    const result = fuse.search(searchTerm);
    setResults(result);
  };

  return (
    <div className="relative">
      <div className="relative flex flex-col items-center ">
        <h1 className="mb-4 text-4xl font-bold">O que você está procurando?</h1>

        <input
          type="search"
          name="search"
          placeholder="Qual o melhor tipo de bicicletário?"
          className="w-full h-10 px-5 pr-10 text-sm text-gray-600 bg-white rounded shadow-2xl focus:outline-none"
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => {
            setSearchResultsVisible(true);
          }}
          onBlur={(e) => {
            // Delay para permitir clique nos resultados
            setTimeout(() => {
              setSearchResultsVisible(false);
            }, 200);
          }}
        />
      </div>
      {searchTerm.length > 0 && searchResultsVisible && (
        <div
          className="absolute left-0 right-0 z-10 mt-2 mb-4 overflow-hidden overflow-y-auto text-left text-gray-800 normal-case bg-white border rounded-lg shadow w-108"
          style={{ maxHeight: "32rem" }}
        >
          <div className="flex flex-col">
            {results.map((result) => {
              return (
                <Link
                  to={`/biciclopedia/${result.item.id}`}
                  key={result.item.id}
                >
                  <div
                    className="p-4 text-xl border-b border-gray-400 cursor-pointer hover:bg-gray-100 hover:border-red-500"
                  >
                    <Highlight
                      search={searchTerm}
                      matchStyle={{ background: "#00808080" }}
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    >
                      {decodeHtmlEntities(result.item.title)}
                    </Highlight>
                    <span className="block my-1 text-sm font-normal">
                      <Highlight
                        search={searchTerm}
                        matchStyle={{ background: "#00808080" }}
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      >
                        {decodeHtmlEntities(result.item.description)}
                      </Highlight>
                    </span>
                  </div>
                </Link>
              );
            })}
            {results.length === 0 && (
              <div className="w-full p-4 font-normal border-b cursor-pointer">
                <p className="my-0">
                  Nenhum resultado para <strong>{searchTerm}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
