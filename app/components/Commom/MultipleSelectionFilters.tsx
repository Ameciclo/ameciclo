import { SelectionFilter } from "./SelectionFilter";

export function MultipleSelectionFilters({ title = "", filters }: any) {
  return (
    <>
      <h1 className="text-4xl md:text-5xl text-center font-bold pb-5">
        {title}
      </h1>
      <div className="flex flex-col md:flex-row flex-wrap align-baseline gap-4 md:gap-10 justify-center flex-grow mx-auto">
        {filters.length > 0 &&
          filters.map((filter: any, index: number) => <SelectionFilter key={filter.name || index} {...filter} />)}
      </div>
    </>
  );
}
