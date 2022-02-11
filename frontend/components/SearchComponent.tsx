import React, { useState } from "react";
import { Highlight } from "react-highlighter-ts";

export const SearchComponent = (props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [results, setResults] = useState([]);

  const handleChange = async (event) => {
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
          onBlur={() => {
            setSearchResultsVisible(false);
          }}
        />
      </div>
      {searchTerm.length > 0 && (
        /*searchResultsVisible &&*/ <div
          className="absolute left-0 right-0 z-10 mt-2 mb-4 overflow-hidden overflow-y-auto text-left text-gray-800 normal-case bg-white border rounded-lg shadow w-108"
          style={{ maxHeight: "32rem" }}
        >
          <div className="flex flex-col">
            {results.map((result) => {
              return (
                <a
                  href={`/biciclopedia/${result.item.id}`}
                  key={result.item.id}
                >
                  <div
                    className="p-4 text-xl border-b border-gray-400 cursor-pointer hover:bg-gray-100 hover:border-red-500"
                    key={result.item.id}
                    //onClick={handleClick
                    /*(e) => {
                    e.preventDefault()
                    setSearchResultsVisible(true)
                    console.log("id");
                    }
                  */
                    //}
                  >
                    <Highlight
                      search={searchTerm}
                      matchStyle={{ background: "#00808080" }}
                    >
                      {result.item.title}
                    </Highlight>
                    <span className="block my-1 text-sm font-normal">
                      <Highlight
                        search={searchTerm}
                        matchStyle={{ background: "#00808080" }}
                      >
                        {result.item.description}
                      </Highlight>
                    </span>
                  </div>
                </a>
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

// <p className="hidden mt-6 text-lg md:block">
//   Você também pode navegar pelos tópicos abaixo para encontrar o que
//   procura.
// </p>
