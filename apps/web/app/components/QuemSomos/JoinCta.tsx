import { Link } from "@tanstack/react-router";
import { Button } from "@ameciclo/ui/components/button";

const onTeal = "border-white bg-transparent text-white hover:bg-white hover:text-ameciclo";

export function JoinCta() {
  return (
    <section
      aria-labelledby="participar"
      className="mt-16 rounded-sm bg-ameciclo p-8 text-center text-white lg:p-14"
    >
      <h2 id="participar" className="text-3xl font-bold">
        Faça parte da mudança
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-white/90">
        Participe das atividades, associe-se para ter voz nas decisões ou apoie financeiramente o
        trabalho por ciclovias, dados e cidades mais humanas.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" variant="secondary">
          <a href="http://queroser.ameciclo.org" target="_blank" rel="noopener noreferrer">
            Quero me associar
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className={onTeal}>
          <Link to="/participe">Participe das atividades</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className={onTeal}>
          <a href="http://apoie.ameciclo.org" target="_blank" rel="noopener noreferrer">
            Apoie
          </a>
        </Button>
      </div>
    </section>
  );
}
