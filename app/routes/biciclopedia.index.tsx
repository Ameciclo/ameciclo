import { createFileRoute } from "@tanstack/react-router";
import Breadcrumb from "../components/Commom/Breadcrumb";
import { SearchComponent } from "../components/Biciclopedia/SearchComponent";
import { AccordionItem } from "../components/Biciclopedia/AccordionFAQ";
import { useSuspenseQuery } from "@tanstack/react-query";
import { biciclopediaQueryOptions } from "~/loader/biciclopedia";

interface FAQ {
  id: number;
  title: string;
  description: string;
  answer?: string;
}

interface Category {
  id: number;
  title: string;
  faqs: FAQ[];
}

export const Route = createFileRoute("/biciclopedia/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(biciclopediaQueryOptions()),
  head: () => ({
    meta: [
      { title: "Biciclopedia - Ameciclo" },
      { name: "description", content: "Perguntas e respostas sobre mobilidade urbana e ciclismo" },
    ],
  }),
  component: Biciclopedia,
});

function Biciclopedia() {
  const { data: { faqs, categories } } = useSuspenseQuery(biciclopediaQueryOptions());

  const disponibleCategories = categories.filter((category: Category) => category.faqs.length > 0);
  const sortedCategories = disponibleCategories.sort((a: Category, b: Category) => a.title.localeCompare(b.title));

  return (
    <>
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill my-auto flex items-center justify-center"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/biciclopedia.webp')`,
        }}
      >
        <div className="container mx-auto" style={{ maxWidth: "768px" }}>
          <SearchComponent faqs={faqs} />
        </div>
      </div>
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Biciclopedia"
            slug="/biciclopedia"
            routes={["/"]}
          />
        </div>
      </div>
      <section className="container mx-auto mt-8 my-4 px-4">
        <div className="flex flex-col bg-white mb-6 shadow-xl rounded-lg">
          {sortedCategories.length === 0 ? (
            <div className="p-4">Nenhuma categoria encontrada</div>
          ) : (
            sortedCategories.map((cat: Category) => (
              <AccordionItem categories={cat} key={cat.id} />
            ))
          )}
        </div>
      </section>
    </>
  );
}
