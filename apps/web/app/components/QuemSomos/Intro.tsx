import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { Button } from "@ameciclo/ui/components/button";

interface IntroProps {
  definition: string | undefined;
  objective: string | undefined;
}

const onTeal = "border-white bg-transparent text-white hover:bg-white hover:text-ameciclo";

export function Intro({ definition, objective }: IntroProps) {
  return (
    <section className="rounded-sm bg-ameciclo p-8 text-white lg:p-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Quem somos</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <h1 className="text-2xl font-semibold leading-snug lg:text-4xl">
          {/* The CMS stores this as markdown; as a heading it must not wrap in a <p>. */}
          <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>
            {definition}
          </ReactMarkdown>
        </h1>
        <div>
          <p className="leading-relaxed text-white/90 lg:text-lg">{objective}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/participe">Participe</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={onTeal}>
              <a href="#pessoas">Conheça quem faz</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
