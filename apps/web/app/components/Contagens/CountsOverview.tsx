import { Card } from "@ameciclo/ui/components/card";

type Stat = { title: string; value: string };

// Headline numbers: a dark teal band right under the breadcrumb.
export function CountsStatsBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-ameciclo-dark text-white" aria-labelledby="estatisticas-gerais">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 id="estatisticas-gerais" className="text-center text-sm font-semibold tracking-[0.2em] text-white/80 uppercase md:text-left">
          Contagens de ciclistas · Estatísticas gerais
        </h1>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-white/20">
          {stats.map((stat) => (
            <div key={stat.title} className="flex flex-col-reverse gap-1 md:px-6 md:first:pl-0">
              <dt className="text-xs font-medium tracking-widest text-white/80 uppercase">{stat.title}</dt>
              <dd className="text-4xl leading-none font-bold tabular-nums sm:text-5xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

type Explanation = { title: string; description: string | null };

export function CountsIntro({ boxes }: { boxes: Explanation[] }) {
  return (
    <section className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:py-14">
      {boxes.map((box) => (
        <div key={box.title} className="border-l-4 border-primary pl-5">
          <h2 className="mb-2 text-2xl font-bold text-foreground">{box.title}</h2>
          {box.description ? (
            <p className="leading-relaxed text-muted-foreground">{box.description}</p>
          ) : (
            <div className="space-y-2 animate-pulse" aria-hidden>
              <div className="h-4 w-full rounded-sm bg-muted" />
              <div className="h-4 w-5/6 rounded-sm bg-muted" />
              <div className="h-4 w-4/6 rounded-sm bg-muted" />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

type ProfileCard = { label: string; data: string; icon: string };

// Share of counted people with each characteristic (women, helmet, cargo bikes...).
export function CountsProfile({ cards }: { cards: ProfileCard[] | null | undefined }) {
  if (!cards || cards.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-10 md:py-14" aria-labelledby="perfil-ciclistas">
      <h2 id="perfil-ciclistas" className="text-2xl font-bold text-foreground md:text-3xl">
        Perfil de quem pedala
      </h2>
      <p className="mt-1 mb-6 text-muted-foreground">Participação de cada característica no total de ciclistas contados.</p>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="flex-row items-center justify-between gap-3 border-l-4 border-l-primary px-4 py-4 shadow-sm">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{card.label}</p>
              <p className="text-3xl font-bold text-primary tabular-nums sm:text-4xl">{card.data}</p>
            </div>
            <img src={`/icons/contagens/${card.icon}.svg`} className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" alt="" />
          </Card>
        ))}
      </div>
    </section>
  );
}
