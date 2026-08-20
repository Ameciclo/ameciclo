import React, { useMemo, useState } from "react";
import { DocumentsList } from "./DocumentList";
import { Search } from "lucide-react";
import type { DocumentEntry } from "~/queries/dados.documentos";

export const docTypes = [
  { value: "all", label: "Todos documentos", color: "", fontColor: "" },
  { value: "studies", label: "Estudos e pesquisas", color: "#008080", fontColor: "#581f0f" },
  { value: "books", label: "Livros", color: "#F6D55C", fontColor: "#581f0f" },
  { value: "other", label: "Outros", color: "#20639B", fontColor: "#dbf4c6" },
];

interface DocumentsSessionProps {
  documents: DocumentEntry[];
}

export const DocumentsSession: React.FC<DocumentsSessionProps> = ({ documents = [] }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("all");
  const [selectedDocumentOrder, setSelectedDocumentsOrder] = useState<string>("date-newer");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const orderedDocuments = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const filtered = documents.filter((doc) => {
      const matchesType = selectedDocumentType === "all" || doc.type === selectedDocumentType;
      const matchesSearch =
        search === "" ||
        (doc.title ?? "").toLowerCase().includes(search) ||
        (doc.description ?? "").toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });

    const byDate = (a: DocumentEntry, b: DocumentEntry) =>
      (a.release_date ?? "") < (b.release_date ?? "") ? 1 : -1;
    const byTitle = (a: DocumentEntry, b: DocumentEntry) =>
      (a.title ?? "").localeCompare(b.title ?? "");

    const sorted = [...filtered];
    switch (selectedDocumentOrder) {
      case "date-newer":
        sorted.sort(byDate);
        break;
      case "date-older":
        sorted.sort((a, b) => -byDate(a, b));
        break;
      case "alfa":
        sorted.sort(byTitle);
        break;
      case "anti-alfa":
        sorted.sort((a, b) => -byTitle(a, b));
        break;
    }
    return sorted;
  }, [documents, selectedDocumentType, selectedDocumentOrder, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-xs border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
          {/* Search Bar */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar documentos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Digite o título do documento..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Order Filter */}
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={selectedDocumentOrder}
              onChange={(e) => setSelectedDocumentsOrder(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
            >
              <option value="date-newer">Mais recente</option>
              <option value="date-older">Mais antigo</option>
              <option value="alfa">A-Z</option>
              <option value="anti-alfa">Z-A</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de documento
            </label>
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
            >
              {docTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {orderedDocuments.length} documento{orderedDocuments.length !== 1 ? 's' : ''} encontrado{orderedDocuments.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>
      </div>

      <DocumentsList documents={orderedDocuments} docTypes={docTypes} searchTerm={searchTerm} />
    </div>
  );
};
