import { useState } from "react";
import AmeCiclistaModal from "./AmeCiclistaModal";
import InfoSectionLoading from "./InfoSectionLoading";
import AmeciclistasLoading from "./AmeciclistasLoading";
import { InfoSection } from "./InfoSection";
import { MemberCard } from "./MemberCard";
import { Tab, TabPanel, Tabs, TabsNav } from "./Tabs";

interface QuemSomosContentProps {
  pageData: {
    ameciclistas?: any[];
    custom?: {
      definition?: string;
      objective?: string;
      links?: Array<{ id: string; title: string; link: string }>;
    };
    ameciclistasLoading?: boolean;
    customLoading?: boolean;
  };
}

export function QuemSomosContent({ pageData }: QuemSomosContentProps) {
  const { ameciclistas = [], custom = {}, ameciclistasLoading = false, customLoading = false } = pageData || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmeciclista, setSelectedAmeciclista] = useState(null);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);

  const handleCardClick = (ameciclista: any, event: React.MouseEvent<HTMLButtonElement>) => {
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

  const coordinators = ameciclistas.filter((a: any) => a.role === "coordenacao");
  const counselors = ameciclistas.filter((a: any) => a.role === "conselhofiscal" || a.role === "concelhofiscal");

  return (
    <div className="container mx-auto mt-8 mb-8">
      {customLoading ? (
        <InfoSectionLoading />
      ) : (
        <InfoSection
          definition={custom?.definition}
          objective={custom?.objective}
          links={custom?.links}
        />
      )}

      <Tabs initialValue="tab-ameciclista">
        <TabsNav>
          <Tab name="tab-ameciclista">Ameciclistas</Tab>
          <Tab name="tab-coord">Coordenação</Tab>
          <Tab name="tab-conselho">Conselho Fiscal</Tab>
        </TabsNav>

        <TabPanel name="tab-coord">
          {ameciclistasLoading ? (
            <AmeciclistasLoading />
          ) : (
            coordinators.map((c: any) => (
              <MemberCard
                key={c.id}
                member={c}
                onClick={(e) => handleCardClick(c, e)}
                showBio
              />
            ))
          )}
        </TabPanel>

        <TabPanel name="tab-conselho">
          {ameciclistasLoading ? (
            <AmeciclistasLoading />
          ) : (
            counselors.map((c: any) => (
              <MemberCard
                key={c.id}
                member={c}
                onClick={(e) => handleCardClick(c, e)}
                showBio
              />
            ))
          )}
        </TabPanel>

        <TabPanel name="tab-ameciclista">
          {ameciclistasLoading ? (
            <AmeciclistasLoading />
          ) : (
            ameciclistas.map((c: any) => (
              <MemberCard
                key={c.id}
                member={c}
                onClick={(e) => handleCardClick(c, e)}
              />
            ))
          )}
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
