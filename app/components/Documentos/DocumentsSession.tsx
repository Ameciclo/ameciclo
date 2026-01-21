import React, { useEffect, useState } from "react";
import { DocumentsList } from "./DocumentList";
import { Search } from "lucide-react";

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
  description: string;
  release_date: string;
}

interface DocumentsSessionProps {
  documents: Document[];
}

export const DocumentsSession: React.FC<DocumentsSessionProps> = ({ documents = [] }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("all");
  const [selectedDocumentOrder, setSelectedDocumentsOrder] = useState<string>("date-newer");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [orderedDocuments, setOrderedDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const filtered = documents.filter((doc) => {
      const matchesType = selectedDocumentType === "all" || doc.type === selectedDocumentType;
      const matchesSearch = searchTerm === "" || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
    setFilteredDocuments(filtered);
  }, [documents, selectedDocumentType, searchTerm]);

  useEffect(() => {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
