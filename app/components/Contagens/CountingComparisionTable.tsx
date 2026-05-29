"use client";
import React from "react";
import { matchSorter } from "match-sorter";
import { Link } from "@tanstack/react-router";
import { ColumnFilter, NumberRangeColumnFilter } from "~/components/Commom/Table/TableFilters";
import Table from "~/components/Commom/Table/Table";
import { IntlDateStr } from "~/services/utils";

function fuzzyTextFilterFn(rows: any[], id: string, filterValue: string) {
  return matchSorter(rows, filterValue, { keys: [(row: any) => row.values[id]] });
}

fuzzyTextFilterFn.autoRemove = (val: any) => !val;

interface CountingComparisionTableProps {
  data: any[];
  compareSlugs: string[];
}

function removeSlug(slugs: string[], target: string): string[] {
  return slugs.filter((s) => s !== target);
}

export const CountingComparisionTable = ({ data, compareSlugs }: CountingComparisionTableProps) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isCompared = (slug: string) => compareSlugs.includes(slug);

  const groupedData = React.useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const map = new Map<number, any>();
    const result: any[] = [];

    for (const item of sorted) {
      if (!map.has(item.id)) {
        const parent = { ...item, subRows: [], count_total: 1 };
        map.set(item.id, parent);
        result.push(parent);
      } else {
        const parent = map.get(item.id)!;
        parent.subRows.push(item);
        parent.count_total++;
      }
    }

    const comparedGroups = result.filter((g) =>
      g.subRows.some((c: any) => isCompared(c.slug)) || isCompared(g.slug),
    );
    const otherGroups = result.filter((g) =>
      !g.subRows.some((c: any) => isCompared(c.slug)) && !isCompared(g.slug),
    );

    return [...comparedGroups, ...otherGroups];
  }, [data, compareSlugs]);

  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      text: (rows: any[], id: string, filterValue: string) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
      between: (rows: any[], id: string, filterValue: [number, number]) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          if (rowValue === undefined) return true;
          if (filterValue[0] && rowValue < filterValue[0]) return false;
          if (filterValue[1] && rowValue > filterValue[1]) return false;
          return true;
        });
      },
    }),
    [],
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Nome",
        accessor: "name",
        Cell: ({ row }: { row: any }) => (
          <div className="flex items-center gap-2" style={{ paddingLeft: (row.depth || 0) * 18 }}>
            {row.canExpand ? (
              <button {...row.getToggleRowExpandedProps()} className="text-gray-400 hover:text-gray-600 w-4 shrink-0 text-xs leading-none">
                {row.isExpanded ? "\u25BE" : "\u25B8"}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <Link
              className="text-ameciclo hover:underline"
              to="/dados/contagens/$slug"
              params={{ slug: row.original.slug }}
            >
              {row.original.name}
            </Link>
            {row.original.count_total! > 1 && !row.depth && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                {row.original.count_total}
              </span>
            )}
          </div>
        ),
        Filter: ColumnFilter,
        filter: (rows: any[], id: string, filterValue: string) => {
          if (!filterValue) return rows;
          const lower = filterValue.toLowerCase();
          return rows.filter((row) => {
            if (String(row.values[id] || "").toLowerCase().includes(lower)) return true;
            for (const child of row.subRows || []) {
              if (String(child.values[id] || "").toLowerCase().includes(lower)) return true;
            }
            return false;
          });
        },
      },
      {
        Header: "Data",
        accessor: "date",
        Cell: ({ value }: { value: string }) => value ? <span>{IntlDateStr(value)}</span> : <span>-</span>,
        Filter: ColumnFilter,
        filter: (rows: any[], id: string, filterValue: string) => {
          if (!filterValue) return rows;
          const lower = filterValue.toLowerCase();
          return rows.filter((row) => {
            if (String(row.values[id] || "").toLowerCase().includes(lower)) return true;
            for (const child of row.subRows || []) {
              if (String(child.values[id] || "").toLowerCase().includes(lower)) return true;
            }
            return false;
          });
        },
      },
      {
        Header: "Total de Ciclistas",
        accessor: "total_cyclists",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "",
        accessor: "compare",
        Cell: ({ row }: { row: any }) => {
          const slug = row.original.slug;
          if (isCompared(slug)) {
            const remaining = removeSlug(compareSlugs, slug);
            if (remaining.length === 0) return null;
            return (
              <Link
                className="text-red-500 hover:underline font-medium text-sm"
                to={remaining.length === 1 ? "/dados/contagens/$slug" : "/dados/contagens/compare/$slugs"}
                params={
                  remaining.length === 1
                    ? { slug: remaining[0] }
                    : { slugs: remaining.join("&") }
                }
              >
                REMOVER
              </Link>
            );
          }
          const newSlugs = [...compareSlugs, slug].join("&");
          return (
            <Link
              className="text-ameciclo hover:underline font-medium"
              to="/dados/contagens/compare/$slugs"
              params={{ slugs: newSlugs }}
            >
              COMPARAR
            </Link>
          );
        },
        disableFilters: true,
        disableSortBy: true,
      },
    ],
    [compareSlugs],
  );

  if (!isMounted) {
    return (
      <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
        <div className="text-center">
          <h2 className="text-gray-600 text-2xl mb-4">Compare com outras contagens</h2>
          <p className="text-gray-500 mb-4">Carregando dados...</p>
        </div>
      </section>
    );
  }

  if (!groupedData || groupedData.length === 0) {
    return (
      <section className="container mx-auto my-10 shadow-2xl rounded-sm p-12 bg-gray-50">
        <div className="text-center">
          <h2 className="text-gray-600 text-2xl mb-4">Compare com outras contagens</h2>
          <p className="text-gray-500 mb-4">Nenhuma outra contagem disponível para comparação no momento.</p>
        </div>
      </section>
    );
  }

  return (
    <Table
      title={"Compare com outras contagens"}
      data={groupedData}
      columns={columns}
      filterTypes={filterTypes}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      expandMode="subrows"
    />
  );
};
