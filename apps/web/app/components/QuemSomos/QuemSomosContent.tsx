import type { Ameciclista, QuemSomo } from "~/queries/quemsomos";
import { Intro } from "./Intro";
import { JoinCta } from "./JoinCta";
import { PeopleSection } from "./PeopleSection";
import { PersonDialog } from "./PersonDialog";
import { Transparency } from "./Transparency";
import { isCoordination, isFiscalCouncil } from "./roles";

interface QuemSomosContentProps {
  pageData: {
    ameciclistas: Ameciclista[];
    custom: QuemSomo;
  };
  busca: string | undefined;
  pessoaId: string | undefined;
  onBuscaChange: (busca: string | undefined) => void;
  onClosePerson: () => void;
}

export function QuemSomosContent({
  pageData,
  busca,
  pessoaId,
  onBuscaChange,
  onClosePerson,
}: QuemSomosContentProps) {
  const { ameciclistas, custom } = pageData;

  const coordination = ameciclistas.filter(isCoordination);
  const council = ameciclistas.filter(isFiscalCouncil);
  // Coordination and council are shown above; the grid is everyone else.
  const members = ameciclistas.filter((person) => !isCoordination(person) && !isFiscalCouncil(person));
  const selected = ameciclistas.find((person) => String(person.id) === pessoaId);

  return (
    <div className="container mx-auto my-8 px-4">
      <Intro definition={custom.definition ?? undefined} objective={custom.objective ?? undefined} />
      <div className="mt-16">
        <PeopleSection
          coordination={coordination}
          council={council}
          members={members}
          busca={busca}
          onBuscaChange={onBuscaChange}
        />
      </div>
      <Transparency links={custom.links ?? []} />
      <JoinCta />
      <PersonDialog person={selected} onClose={onClosePerson} />
    </div>
  );
}
