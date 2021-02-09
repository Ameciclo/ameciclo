import SEO from "../../components/SEO";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
//import { Accordion } from "../../components/Accordion";

const Questions = ({ question }) => {
  return (
    <Layout>
      <SEO title={question.faq_tags[0].titles} />
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
        
        <p>{question.title}</p>
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
