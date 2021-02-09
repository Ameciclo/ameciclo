import SEO from "../../components/SEO";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
//import { Accordion } from "../../components/Accordion";
import React from 'react'
import ReactMarkdown from 'react-markdown'
//import {render} from 'react-dom'
//const gfm = require('remark-gfm')
//render(<ReactMarkdown># Hello, *world*!</ReactMarkdown>, document.body)

const Questions = ({ question }) => {
  
  return (
    <Layout>
      <SEO title={question.title} />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "40vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/biciclopedia.webp')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
        <Breadcrumb
            label={question.faq_tags[0].title}
            slug="/biciclopedia"
            routes={["/", "/biciclopedia", question.faq_tags[0].slug]}
          />{" "}
        </div>
      </div>
      <section className="container mx-auto my-8">
        <div className="flex flex-col bg-white  mb-6 shadow-xl rounded-lg">
            <div className="px-6">
              <div className="text-center mt-12">
                <h3 className="text-4xl font-semibold leading-normal mb-2 text-gray-800 mb-2">
                  {question.title}
                </h3>
                <p className="text-2xl font-semibold leading-normal mb-2 text-gray-800 mb-2">
                  {question.description}
                </p>
              </div>
            </div>
            <div className="mt-10 py-10 border-t border-gray-300 text-center">
              <div className="flex flex-wrap justify-center">
                <div className = {
                  "w-full lg:w-9/12 px-4 mb-4 text-lg leading-relaxed text-gray-800 text-center markdown-align"
                  }>
                    <ReactMarkdown children={question.answer} />
                </div>
              </div>
            </div>
          </div>
      </section>
    </Layout>
  );
};

export async function getStaticPaths() {
  const res = await fetch("https://cms.ameciclo.org/faqs");
  const questions = await res.json();

  // Get the paths we want to pre-render based on posts
  const paths = questions.map((q) => ({
    params: { question: `${q.id}` },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    `https://cms.ameciclo.org/faqs?id=${params.question}`
  );
  const question = await res.json();
  //await console.log(question)
  return {
    props: {
      question: question[0],
    },
  };
}

export default Questions;
