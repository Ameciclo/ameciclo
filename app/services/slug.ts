function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyCount(
  location: { name: string },
  count: { id: number | string; date: string },
): string {
  return `${count.id}-${count.date}-${normalize(location.name)}`;
}

export function parseCountIdFromSlug(slug: string): string {
  return slug.split("-")[0];
}
