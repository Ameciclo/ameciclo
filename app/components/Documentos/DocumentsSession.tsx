import React, { useEffect, useState } from "react";
import { MultipleSelectionFilters } from "./SelectionFilterMenu";
import { DocumentsList } from "./DocumentList";

export const docTypes = [
  { value: "all", label: "Todos documentos", color: "", fontColor: "" },
  { value: "studies", label: "Estudos e pesquisas", color: "#008080", fontColor: "#581f0f" },
  { value: "books", label: "Livros", color: "#F6D55C", fontColor: "#581f0f" },
  { value: "other", label: "Outros", color: "#20639B", fontColor: "#dbf4c6" },
];

interface Document {
  id: string;
  type: string;
  title: string;
  release_date: string;
  // … qualquer outra propriedade que você utilize
}

interface DocumentsSessionProps {
  documents: Document[];
}

export const DocumentsSession: React.FC<DocumentsSessionProps> = ({ documents = [] }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("all");
  const [selectedDocumentOrder, setSelectedDocumentsOrder] = useState<string>("random");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [orderedDocuments, setOrderedDocuments] = useState<Document[]>([]);

  // 1) Filtrar quando mudam os documents ou o tipo selecionado
  useEffect(() => {
    const filtered = documents.filter((doc) => {
      if (selectedDocumentType === "all") return true;
      return doc.type === selectedDocumentType;
    });
    setFilteredDocuments(filtered);
  }, [documents, selectedDocumentType]);

  // 2) Ordenar quando mudam o filtro ou a ordem selecionada
  useEffect(() => {
    // clona para não mutar o array original
    const clone = [...filteredDocuments];
    const sorted = clone.sort((a, b) => {
      switch (selectedDocumentOrder) {
        case "date-newer":
          return a.release_date < b.release_date ? 1 : -1;
        case "date-older":
          return a.release_date < b.release_date ? -1 : 1;
        case "alfa":
          return a.title.localeCompare(b.title);
        case "anti-alfa":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    setOrderedDocuments(sorted);
  }, [filteredDocuments, selectedDocumentOrder]);

  return (
    <>
      <MultipleSelectionFilters
        filters={[
          {
            title: "Ordene os documentos",
            value: selectedDocumentOrder,
            name: "docOrder",
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedDocumentsOrder(e.target.value),
            items: [
              { value: "date-newer", label: "Mais recente" },
              { value: "date-older", label: "Mais antigo" },
              { value: "alfa", label: "de A a Z" },
              { value: "anti-alfa", label: "de Z a A" },
            ],
          },
          {
            title: "Selecione o tipo de documento",
            value: selectedDocumentType,
            name: "docType",
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedDocumentType(e.target.value),
            items: docTypes,
          },
        ]}
      />

      <DocumentsList documents={orderedDocuments} docTypes={docTypes} />
    </>
  );
};
