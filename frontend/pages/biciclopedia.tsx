import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { SearchComponent } from "../components/SearchComponent";
import { Accordion } from "../components/Accordion_FAQ";
//import Category from "./biciclopedia/[category]";
{/*import Image from "next/image";
import FAQIcon from "../components/Icons/faq";
import { motion } from "framer-motion";
import Link from "next/link";*/}


const Biciclopedia = ({ /*faqs,*/ categories }) => {

  let disponibleCategories = []

  categories.forEach((category) => {
    if (category.faqs.length > 0) {
      disponibleCategories.push(category)
    }
  });

  categories = disponibleCategories

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
        {/**
        <div className="container mx-auto my-8" style={{ maxWidth: "768px" }}>
          {faqs.length !== 0 && <SearchComponent faqs={faqs} />}
        </div> */}
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

        {/*categories.length === 0 ? (
          <span>Nenhuma pergunta disponivel</span>
        ) : (
          <div
            className="grid gap-4 lg:grid-cols-5 sm:grid-cols-1"
            style={{ justifyItems: "center" }}
          >
            {categories.map((category) => {
              return (
                <Link href={`/biciclopedia/${category.slug}`} key={category.id}>
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <div className="w-56 h-56 bg-white rounded shadow-xl p-4 flex flex-col text-center items-center">
                      {category.icon ? (
                        <Image
                          height={96}
                          width={96}
                          src={category.icon.url}
                        />
                      ) : (
                        <div className="mt-4">
                          <FAQIcon />
                        </div>
                      )}
                      <h3 className="mt-8 text-gray-800 font-bold text-1xl">
                        {category.title}
                      </h3>
                      <p className="my-0">
                        {category.faqs.length === 1 ? (
                          <>
                            <strong>{category.faqs.length}</strong> pergunta
                          </>
                        ) : (
                          <>
                            <strong>{category.faqs.length}</strong> perguntas
                          </>
                        )}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )*/}
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  //const res = await fetch("https://cms.ameciclo.org/faqs"),
  const res_cat = await fetch("https://cms.ameciclo.org/faq-tags");

  let categories = [],
    faqs = [];
  if (res_cat.status === 200) {
    categories = await res_cat.json();
  }
  //if (res.status === 200) {
  //  faqs = await res.json();
  //}

  return {
    props: {
      //faqs,
      categories//,
    },
  };
}

export default Biciclopedia;
