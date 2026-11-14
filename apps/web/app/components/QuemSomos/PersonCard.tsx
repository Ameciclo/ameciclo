import { Link } from "@tanstack/react-router";
import { Card } from "@ameciclo/ui/components/card";
import type { Ameciclista } from "~/queries/quemsomos";
import { Avatar } from "./Avatar";

interface PersonCardProps {
  person: Ameciclista;
  /** "featured" shows a large photo and a bio excerpt; "compact" is a small row. */
  variant: "featured" | "compact";
}

const linkClass =
  "block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ameciclo";

export function PersonCard({ person, variant }: PersonCardProps) {
  const link = (children: React.ReactNode) => (
    <Link
      to="/quemsomos"
      resetScroll={false}
      search={(prev) => ({ ...prev, pessoa: person.id })}
      className={linkClass}
    >
      {children}
    </Link>
  );

  if (variant === "compact") {
    return link(
      <Card className="h-full flex-row items-center gap-3 p-3 shadow-none transition-colors hover:bg-accent">
        <Avatar person={person} className="size-14 shrink-0 rounded-full" />
        <span className="font-medium leading-tight">{person.name}</span>
      </Card>,
    );
  }

  return link(
    <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Avatar person={person} className="aspect-square w-full" />
      <div className="p-5">
        <h3 className="text-lg font-semibold">{person.name}</h3>
        {person.bio && <p className="mt-2 line-clamp-4 text-sm text-gray-600">{person.bio}</p>}
      </div>
    </Card>,
  );
}
