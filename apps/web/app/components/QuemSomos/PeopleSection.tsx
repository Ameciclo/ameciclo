import { Input } from "@ameciclo/ui/components/input";
import type { Ameciclista } from "~/queries/quemsomos";
import { PersonCard } from "./PersonCard";
import { normalize } from "./roles";

interface PeopleSectionProps {
  coordination: Ameciclista[];
  council: Ameciclista[];
  members: Ameciclista[];
  busca: string | undefined;
  onBuscaChange: (busca: string | undefined) => void;
}

function FeaturedGroup({ id, title, people }: { id: string; title: string; people: Ameciclista[] }) {
  if (people.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mt-10">
      <h3 id={id} className="text-xl font-semibold">
        {title}
      </h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {people.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} variant="featured" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PeopleSection({
  coordination,
  council,
  members,
  busca,
  onBuscaChange,
}: PeopleSectionProps) {
  const query = normalize(busca ?? "");
  const shown = query ? members.filter((m) => normalize(m.name ?? "").includes(query)) : members;

  return (
    <section id="pessoas" aria-labelledby="pessoas-titulo" className="scroll-mt-20">
      <h2 id="pessoas-titulo" className="text-3xl font-bold">
        Quem faz a Ameciclo
      </h2>
      <p className="mt-2 max-w-3xl text-gray-600">
        A associação é conduzida por uma coordenação e fiscalizada por um conselho fiscal, ambos
        eleitos pelas pessoas associadas. Toda pessoa tem voz nas assembleias.
      </p>

      <FeaturedGroup id="coordenacao" title="Coordenação" people={coordination} />
      <FeaturedGroup id="conselho" title="Conselho Fiscal" people={council} />

      <section aria-labelledby="ameciclistas" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 id="ameciclistas" className="text-xl font-semibold">
            Ameciclistas{" "}
            <span className="text-base font-normal text-gray-500">
              ({query ? `${shown.length} de ${members.length}` : members.length})
            </span>
          </h3>
          <Input
            type="search"
            value={busca ?? ""}
            onChange={(event) => onBuscaChange(event.target.value || undefined)}
            placeholder="Buscar por nome"
            aria-label="Buscar ameciclista por nome"
            className="sm:max-w-xs"
          />
        </div>
        {shown.length === 0 ? (
          <p className="mt-6 text-gray-600">Nenhuma pessoa encontrada para “{busca}”.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((person) => (
              <li key={person.id}>
                <PersonCard person={person} variant="compact" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
