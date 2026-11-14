import type { Ameciclista } from "~/queries/quemsomos";
import { initials } from "./roles";

interface AvatarProps {
  person: Ameciclista;
  /** Tailwind size + shape classes for the box (e.g. "size-24 rounded-full"). */
  className: string;
  eager?: boolean;
}

export function Avatar({ person, className, eager = false }: AvatarProps) {
  const media = person.media;
  if (media?.url) {
    return (
      <img
        src={media.url}
        alt=""
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`${className} object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${className} flex items-center justify-center bg-ameciclo/10 font-semibold text-ameciclo`}
    >
      {initials(person.name)}
    </span>
  );
}
