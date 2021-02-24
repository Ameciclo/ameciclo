import React, { useState } from "react";
import Fuse from "fuse.js";
import Highlight from "react-highlighter";
//import { redirect } from "next/dist/next-server/server/api-utils";
import { useHistory } from "react-router-dom";

export const SearchComponent = (props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [results, setResults] = useState([]);

  let history = useHistory();

  const fuse = new Fuse(props.faqs, {
    shouldSort: true,
    keys: ["title", "description"],
    minMatchCharLength: 3,
    includeMatches: true,
    threshold: 0.3,
  });

  const handleChange = async (event) => {
    setSearchTerm(event.target.value);
    const result = await fuse.search(searchTerm);
    setResults(result);
  };

  const handleClick = (e) => {
    e.preventDefault();
    console.log('O link foi clicado.');
    history.push("/projetos");
  }

  return (
    <div className="relative">
      <div className="flex flex-col items-center relative ">
        <h1 className="text-4xl font-bold mb-4">O que você está procurando?</h1>
        <input
          type="search"
          name="search"
          placeholder="Qual o melhor tipo de bicicletário?"
          className="bg-white text-gray-600 w-full h-10 px-5 pr-10 rounded shadow-2xl text-sm focus:outline-none"
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
      {searchTerm.length > 0 && searchResultsVisible && (
        <div
          className="text-gray-800 absolute normal-case bg-white border left-0 right-0 w-108 text-left mb-4 mt-2 rounded-lg shadow overflow-hidden z-10 overflow-y-auto"
          style={{ maxHeight: "32rem" }}
        >
          <div className="flex flex-col">
            {results.map((result) => {
              return (
                <a href={`/biciclopedia/${result.item.id}`}>
                <div
                  className="border-b border-gray-400 text-xl cursor-pointer p-4 hover:bg-gray-100 hover:border-red-500"
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
                  <Highlight search={searchTerm} matchStyle={{background: "#00808080"}}>{result.item.title}</Highlight>
                  <span className="block font-normal text-sm my-1">
                    <Highlight search={searchTerm} matchStyle={{background: "#00808080"}}>
                      {result.item.description}
                    </Highlight>
                  </span>
                </div></a>
              );
            })}
            {results.length === 0 && (
              <div className="font-normal w-full border-b cursor-pointer p-4">
                <p className="my-0">
                  Nenhum resultado para '<strong>{searchTerm}</strong>'
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// <p className="mt-6 text-lg hidden md:block">
//   Você também pode navegar pelos tópicos abaixo para encontrar o que
//   procura.
// </p>
