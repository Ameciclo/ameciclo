import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { SearchComponent } from "../components/SearchComponent";
import FAQIcon from "../components/Icons/faq";
import { Accordion } from "../components/Accordion_FAQ";


const Biciclopedia = ({ faqs, categories }) => {

  categories.sort((a, b) => {
    return a.title.localeCompare(b.title)
  });

  return (
    <Layout>
      <SEO title="Biciclopedia" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "auto",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/biciclopedia.webp')`,
        }}
      >
        <div className="container mx-auto my-8" style={{ maxWidth: "768px" }}>
          {faqs.length !== 0 && <SearchComponent faqs={faqs} />}
        </div>
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

        <Accordion faqs={categories} />

      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch("https://cms.ameciclo.org/faqs"),
    res_cat = await fetch("https://cms.ameciclo.org/faq-tags");

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
