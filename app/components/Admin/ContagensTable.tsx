import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Pencil } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export type ContagemRow = {
  id: number | string;
  name: string;
  slug: string;
  date: string;
  total_cyclists: number;
};

type SortKey = "name" | "date" | "total_cyclists";
type SortDir = "asc" | "desc";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return dateFormatter.format(d);
}

export function ContagensTable({ rows }: { rows: ContagemRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
    const sorted = [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [rows, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome do ponto..."
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filtered.length.toLocaleString("pt-BR")} de{" "}
          {rows.length.toLocaleString("pt-BR")}
        </Badge>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Ponto" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              <SortableHead label="Data" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
              <SortableHead label="Ciclistas" align="right" active={sortKey === "total_cyclists"} dir={sortDir} onClick={() => toggleSort("total_cyclists")} />
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-12">
                  Nenhum ponto corresponde à busca.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, idx) => (
                <TableRow key={`${row.id}-${row.date}-${idx}`}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.total_cyclists.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/dados/contagens/$slug" params={{ slug: row.slug }}>
                        <Pencil className="size-4" />
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
        {active && <span aria-hidden>{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </TableHead>
  );
}
