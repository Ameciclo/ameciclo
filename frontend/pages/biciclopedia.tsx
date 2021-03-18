import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { SearchComponent } from "../components/SearchComponent";
import { AccordionItem } from "../components/Accordion_FAQ";
import { server } from "../config";

const Biciclopedia = ({ faqs, categories }) => {
  let disponibleCategories = [];

  categories.forEach((category) => {
    if (category.faqs.length > 0) {
      disponibleCategories.push(category);
    }
  });

  categories = disponibleCategories;

  categories.sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  return (
    <Layout>
      <SEO title="Biciclopedia" />
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
        {
          <div className="container mx-auto" style={{ maxWidth: "768px" }}>
            {faqs.length !== 0 && <SearchComponent faqs={faqs} />}
          </div>
        }
      </div>
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label="Biciclopedia"
            slug="/biciclopedia"
            routes={["/", "/biciclopedia"]}
          />
        </div>
      </div>
      <section className="container mx-auto mt-8 my-4 px-4">
        <div className="flex flex-col bg-white mb-6 shadow-xl rounded-lg">
          {categories.map((cat) => (
            <AccordionItem categories={cat} key={cat.id} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch(`${server}/faqs`),
    res_cat = await fetch(`${server}/faq-tags`);

  let categories = [],
    faqs = [];
  if (res_cat.status === 200) {
    categories = await res_cat.json();
  }
  if (res.status === 200) {
    faqs = await res.json();
  }

  return {
    props: {
      faqs,
      categories,
    },
  };
}

export default Biciclopedia;
