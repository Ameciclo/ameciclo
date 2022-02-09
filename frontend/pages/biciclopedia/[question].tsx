import SEO from "../../components/SEO";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import React from "react";
import ReactMarkdown from "react-markdown";
import { server } from "../../config";

const Questions = ({ question }) => {
  return (
    <Layout>
      <SEO title={question.title} />
      <div
        className="object-fill h-auto px-10 py-24 text-white bg-center bg-cover"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/biciclopedia.webp')`,
        }}
      />
      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb
            label={question.faq_tags[0].title}
            slug="/biciclopedia"
            routes={["/", "/biciclopedia", question.faq_tags[0].slug]}
          />{" "}
        </div>
      </div>
      <section className="container mx-auto my-8">
        <div className="flex flex-col mb-6 bg-white rounded-lg shadow-xl">
          <div className="px-6">
            <div className="mt-12 text-center">
              <h3 className="mb-2 text-4xl font-semibold leading-normal text-gray-800">
                {question.title}
              </h3>
              <p className="mb-2 text-2xl font-semibold leading-normal text-gray-800">
                {question.description}
              </p>
            </div>
          </div>
          <div className="py-10 mt-10 text-center border-t border-gray-300">
            <div className="flex flex-wrap justify-center">
              <div className="w-full px-4 mb-4 text-lg leading-relaxed text-center text-gray-800 lg:w-9/12 markdown_box">
                <ReactMarkdown>{question.answer}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export async function getStaticPaths() {
  const res = await fetch(`${server}/faqs`),
    questions = await res.json();

  // Get the paths we want to pre-render based on posts
  const paths = questions.map((q) => ({
    params: { question: `${q.id}` },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`${server}/faqs?id=${params.question}`),
    question = await res.json();
  return {
    props: {
      question: question[0],
    },
  };
}

export default Questions;
