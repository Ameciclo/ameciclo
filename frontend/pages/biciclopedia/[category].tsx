import SEO from "../../components/SEO";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import { Accordion } from "../../components/Accordion";

const Category = ({ category }) => {
  return (
    <Layout>
      <SEO title={category.title} />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "40vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/projetos.png')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb
            label={category.title}
            slug={category.slug}
            routes={["/", "/biciclopedia", category.slug]}
          />{" "}
        </div>
      </div>
      <section className="container mx-auto my-8">
        <Accordion faqs={category.faqs} />
      </section>
    </Layout>
  );
};

export async function getStaticPaths() {
  const res = await fetch("https://cms.ameciclo.org/faq-tags");
  const categories = await res.json();

  // Get the paths we want to pre-render based on posts
  const paths = categories.map((c) => ({
    params: { category: c.slug },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    `https://cms.ameciclo.org/faq-tags?slug=${params.category}`
  );
  const category = await res.json();
  return {
    props: {
      category: category[0],
    },
  };
}

export default Category;
