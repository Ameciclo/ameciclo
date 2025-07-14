import Apoie from "../Commom/Icones/apoie";
import Associe from "../Commom/Icones/associe";
import Participe from "../Commom/Icones/participe";
import { Link } from "@remix-run/react";

export default function SectionCallToAction({ home }: any) {
    try {
        if(!home.id) throw new Error("Erro ao carregar dados do Strapi");
        
        return (
            <section className="bg-ameciclo">
                <div className="container px-6 py-6 mx-auto">
                    <div className="flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-0">
                        <Link className="buttom-call-actions" to="/participe"><Participe /></Link>
                        <Link className="buttom-call-actions" to={home.association_url}><Associe /></Link>
                        <Link className="buttom-call-actions" to={home.donate_url}><Apoie /></Link>
                    </div>
                </div>
            </section>
        );
    } catch (err) {
        return (
            <section className="bg-ameciclo">
                <div className="container px-6 py-6 mx-auto">
                    <div className="flex flex-col sm:flex-row justify-around items-center gap-4 sm:gap-0">
                        <Link className="buttom-call-actions" to="/participe"><Participe /></Link>
                        <Link className="buttom-call-actions" to="https://queroser.ameciclo.org"><Associe /></Link>
                        <Link className="buttom-call-actions" to="https://apoia.se/ameciclo"><Apoie /></Link>
                    </div>
                </div>
            </section>
        );
    }
}
