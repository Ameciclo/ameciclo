import { useState } from "react";
import AmeCiclistaModal from "./AmeCiclistaModal";
import { InfoSection } from "./InfoSection";
import { MemberCard } from "./MemberCard";
import { Tab, TabPanel, Tabs, TabsNav } from "./Tabs";
import type { Ameciclista, QuemSomo } from "~/queries/quemsomos";

interface QuemSomosContentProps {
  pageData: {
    ameciclistas: Ameciclista[];
    custom: QuemSomo;
  };
}

export function QuemSomosContent({ pageData }: QuemSomosContentProps) {
  const { ameciclistas, custom } = pageData;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmeciclista, setSelectedAmeciclista] = useState<Ameciclista | null>(null);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);

  const handleCardClick = (ameciclista: Ameciclista, event: React.MouseEvent<HTMLButtonElement>) => {
    setLastFocusedElement(event.currentTarget);
    setSelectedAmeciclista(ameciclista);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAmeciclista(null);
    if (lastFocusedElement) {
      setTimeout(() => lastFocusedElement.focus(), 0);
    }
  };

  const coordinators = ameciclistas.filter((a) => a.role === "coordenacao");
  const counselors = ameciclistas.filter(
    (a) => a.role === "conselhofiscal" || a.role === "concelhofiscal",
  );

  return (
    <div className="container mx-auto mt-8 mb-8">
      <InfoSection
        definition={custom.definition ?? undefined}
        objective={custom.objective ?? undefined}
        links={custom.links ?? undefined}
      />

      <Tabs initialValue="tab-ameciclista">
        <TabsNav>
          <Tab name="tab-ameciclista">Ameciclistas</Tab>
          <Tab name="tab-coord">Coordenação</Tab>
          <Tab name="tab-conselho">Conselho Fiscal</Tab>
        </TabsNav>

        <TabPanel name="tab-coord">
          {coordinators.map((c) => (
            <MemberCard
              key={c.id}
              member={c}
              onClick={(e) => handleCardClick(c, e)}
              showBio
            />
          ))}
        </TabPanel>

        <TabPanel name="tab-conselho">
          {counselors.map((c) => (
            <MemberCard
              key={c.id}
              member={c}
              onClick={(e) => handleCardClick(c, e)}
              showBio
            />
          ))}
        </TabPanel>

        <TabPanel name="tab-ameciclista">
          {ameciclistas.map((c) => (
            <MemberCard
              key={c.id}
              member={c}
              onClick={(e) => handleCardClick(c, e)}
            />
          ))}
        </TabPanel>
      </Tabs>

      <AmeCiclistaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ameciclista={selectedAmeciclista}
      />
    </div>
  );
}
