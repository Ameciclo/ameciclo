import Apoie from "../Icons/apoie";
import Associe from "../Icons/associe";
import Participe from "../Icons/participe";
import { Link } from "@remix-run/react";

export default function SectionCallToAction({ home }: any) {
    try {
        if(!home.id) throw new Error("Erro ao carregar dados do Strapi");
        
        return (
            <section className="bg-ameciclo">
                <div className="container px-6 py-20 mx-auto">
                    <div className="flex flex-wrap justify-around">
                        <Link className="buttom-call-actions" to={home.participation_url}><Participe /></Link>
                        <Link className="buttom-call-actions" to={home.association_url}><Associe /></Link>
                        <Link className="buttom-call-actions" to={home.donate_url}><Apoie /></Link>
                    </div>
                </div>
            </section>
        );
    } catch (err) {
        return (
            <section className="bg-ameciclo">
                <a href="/status">!</a>
                <div className="container px-6 py-20 mx-auto">
                    <div className="flex flex-wrap justify-around">
                        <Link className="buttom-call-actions" to="https://participe.ameciclo.org"><Participe /></Link>
                        <Link className="buttom-call-actions" to="https://queroser.ameciclo.org"><Associe /></Link>
                        <Link className="buttom-call-actions" to="https://apoia.se/ameciclo"><Apoie /></Link>
                    </div>
                </div>
            </section>
        );
    }
}
