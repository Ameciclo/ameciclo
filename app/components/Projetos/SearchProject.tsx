type SearchProjectProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

export default function SearchProject({
  searchTerm,
  setSearchTerm,
}: SearchProjectProps) {
  return (
    <div className="w-[300px] px-4 py-2 border border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white sticky top-[66px] z-[50]">
      <input
        type="text"
        placeholder="Buscar projetos por título..."
        className="w-full bg-white outline-none font-bold"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
