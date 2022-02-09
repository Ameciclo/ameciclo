import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import EventCalendar from "../components/Agenda";

const Agenda = () => {
  return (
    <Layout>
      <SEO title="Agenda" />
      <div
        className="object-fill h-auto px-10 py-24 text-white bg-center bg-cover"
        style={{
          width: "100%",
          height: "52vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url('/agenda.webp')`,
        }}
      />
      <div className="flex items-center p-4 text-white uppercase bg-ameciclo">
        <div className="container mx-auto">
          <Breadcrumb label="Agenda" slug="/agenda" routes={["/", "/agenda"]} />
        </div>
      </div>
      <div className="container px-4 py-4 mx-auto my-10">
        <div
          className="px-4 py-4 rounded"
          style={{ borderColor: "rgba(0,0,0,.125)", borderWidth: "1px" }}
        >
          <EventCalendar />
        </div>
      </div>
    </Layout>
  );
};

export default Agenda;
