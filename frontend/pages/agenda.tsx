import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import dynamic from "next/dynamic";
import { server } from "../config";

const EventCalendar = dynamic(() => import("../components/Agenda"), {
  loading: () => <p>Carregando Calendário</p>,
  ssr: false,
});

const Agenda = ({footer}) => {
  return (
    <Layout footer = {footer}>
      <SEO title="Agenda" />
      <div
        className="bg-cover bg-center h-auto text-white py-24 px-10 object-fill"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/agenda.webp')`,
        }}
      />
      <div className="bg-ameciclo text-white p-4 items-center uppercase flex">
        <div className="container mx-auto">
          <Breadcrumb label="Agenda" slug="/agenda" routes={["/", "/agenda"]} />
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 my-10">
        <div
          className="rounded px-4 py-4"
          style={{ borderColor: "rgba(0,0,0,.125)", borderWidth: "1px" }}
        >
          <EventCalendar />
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {

  const res_footer = await fetch(`${server}/footer`);
  let footer;
  if (res_footer.status === 200) {
    footer = await res_footer.json();
  }
 
  return {
    props: {
      footer,
    },
  };
}

export default Agenda;
