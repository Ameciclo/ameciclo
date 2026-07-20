export type PageData = {
  title: string;
  coverImage: string;
  explanationBoxes: Array<{ title: string; description: string }>;
  supportFiles: Array<{
    title: string;
    name: string;
    description: string;
    url: string;
    src: string;
  }>;
  methodology: string | null;
  results: string | null;
};

export type PageDataFallback = Pick<PageData, "title" | "coverImage" | "explanationBoxes">;

export function parsePageData(
  raw: any,
  fallback: PageDataFallback
): PageData {
  const entry = raw?.data?.[0]?.attributes;
  if (!entry) return { ...fallback, supportFiles: [], methodology: null, results: null };

  return {
    title: entry.title || fallback.title,
    coverImage: entry.cover?.data?.attributes?.url || fallback.coverImage,
    explanationBoxes: entry.explanationbox || fallback.explanationBoxes,
    supportFiles: (entry.supportfiles || []).map((f: any) => ({
      title: f.title || f.name || "Documento",
      name: f.title || "",
      description: f.description || "",
      url: f.file?.data?.attributes?.url || "#",
      src: f.cover?.data?.attributes?.url || "/icons/document.svg",
    })),
    methodology: entry.methodology || null,
    results: entry.results || null,
  };
}
