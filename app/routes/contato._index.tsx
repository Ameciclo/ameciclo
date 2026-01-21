import { MetaFunction } from "@remix-run/node";
import Breadcrumb from "~/components/Commom/Breadcrumb";
import bannerContatact from "/contato.webp";
import Banner from "~/components/Commom/Banner";
import { ContactForm } from "~/components/Contato/ContactForm";
import { ContactMap } from "~/components/Contato/ContactMap";

export const meta: MetaFunction = () => {
  return [{ title: "Contato" }];
};

export default function Contato() {
  return (
    <>
      <Banner image={bannerContatact} alt="Mulher negra de cabelo crespo volumoso andando de bicicleta com camisa branca de costas no canto direito do banner, passando ao lado de um bicicletário com várias bicicletas e cones que protegem este bicicletário" />
      <Breadcrumb label="Contato" slug="/contato" routes={["/"]} />
      <section className="container mx-auto my-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactForm />
            <ContactMap />
          </div>
        </div>
      </section>
    </>
  );
}