import { createFileRoute } from "@tanstack/react-router";
import { env } from "~/utils/env.server";
import { fetchWithTimeout } from "~/services/fetchWithTimeout";
import { fetchJsonFromCMS } from "~/services/cmsApi";
import { PROJECTS_LIST_DATA, CMS_BASE_URL } from "~/servers";

/**
 * Static (non-CMS) routes the app exposes. Keep alphabetized by path for
 * auditability. Paths should NOT have trailing slashes (except root).
 *
 * `changefreq` / `priority` are hints only — search engines largely ignore
 * them, but they don't hurt. `lastmod` is omitted for static routes; we
 * don't have a reliable per-page "updated" signal for them.
 */
const STATIC_ROUTES: Array<{
  path: string;
  changefreq?: string;
  priority?: number;
}> = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/agenda", changefreq: "daily", priority: 0.8 },
  { path: "/biciclopedia", changefreq: "weekly", priority: 0.7 },
  { path: "/contato", changefreq: "monthly", priority: 0.6 },
  { path: "/dados", changefreq: "weekly", priority: 0.8 },
  { path: "/dados/ciclodados", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/contagens", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/documentos", changefreq: "monthly", priority: 0.6 },
  { path: "/dados/dom", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/execucaocicloviaria", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/ideciclo", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/loa", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/perfil", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/samu", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/sinistrosfatais", changefreq: "weekly", priority: 0.7 },
  { path: "/dados/viasinseguras", changefreq: "weekly", priority: 0.7 },
  { path: "/participe", changefreq: "monthly", priority: 0.7 },
  { path: "/projetos", changefreq: "weekly", priority: 0.9 },
  { path: "/quemsomos", changefreq: "monthly", priority: 0.7 },
  { path: "/quemsomos/linhadotempo", changefreq: "monthly", priority: 0.6 },
];

/** XML entity escape — minimal set needed for URLs & text nodes. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type Alternate = { hreflang: string; href: string };

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  alternates?: Array<Alternate>;
};

function renderUrl(entry: UrlEntry): string {
  const parts: Array<string> = ["  <url>"];
  parts.push(`    <loc>${xmlEscape(entry.loc)}</loc>`);
  if (entry.lastmod) {
    parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  }
  if (entry.changefreq) {
    parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }
  if (typeof entry.priority === "number") {
    parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  }
  if (entry.alternates?.length) {
    for (const alt of entry.alternates) {
      parts.push(
        `    <xhtml:link rel="alternate" hreflang="${xmlEscape(
          alt.hreflang,
        )}" href="${xmlEscape(alt.href)}" />`,
      );
    }
  }
  parts.push("  </url>");
  return parts.join("\n");
}

async function fetchProjectSlugs(): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  try {
    const res = await fetchWithTimeout(
      PROJECTS_LIST_DATA,
      {},
      5000,
      null,
      () => {},
    );
    const data = res?.data;
    if (!Array.isArray(data)) return [];
    const out: Array<{ slug: string; updatedAt?: string }> = [];
    for (const item of data as any[]) {
      const slug: string | undefined = item?.slug ?? item?.attributes?.slug;
      const updatedAt: string | undefined =
        item?.updatedAt ?? item?.attributes?.updatedAt;
      if (!slug) continue;
      out.push(updatedAt ? { slug, updatedAt } : { slug });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchBiciclopediaQuestionIds(): Promise<
  Array<{ id: string | number; updatedAt?: string }>
> {
  try {
    // Mirror biciclopedia loader's endpoint; return empty on any failure.
    const res = await fetchJsonFromCMS<{ data: Array<any> }>(
      `${CMS_BASE_URL}/api/faqs`,
    );
    const faqs = res?.data;
    if (!Array.isArray(faqs)) return [];
    const out: Array<{ id: string | number; updatedAt?: string }> = [];
    for (const q of faqs) {
      const id = q?.id;
      if (id === undefined || id === null) continue;
      out.push(q?.updatedAt ? { id, updatedAt: q.updatedAt } : { id });
    }
    return out;
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const siteUrl = env.SITE_URL.replace(/\/$/, "");

        // Fetch dynamic sources in parallel; each is individually error-tolerant.
        const [projects, biciclopediaQuestions] = await Promise.all([
          fetchProjectSlugs(),
          fetchBiciclopediaQuestionIds(),
        ]);

        const entries: Array<UrlEntry> = [];

        // 1. Static routes
        for (const r of STATIC_ROUTES) {
          entries.push({
            loc: `${siteUrl}${r.path}`,
            changefreq: r.changefreq,
            priority: r.priority,
          });
        }

        // 2. Projects — one entry per slug. For the Bota Pra Rodar project
        //    the site exposes _en / _es translation slugs; emit those as
        //    siblings plus hreflang alternates on the PT root.
        const BOTA_PRA_RODAR_SLUGS = new Set([
          "bota-pra-rodar",
          "bota_pra_rodar",
        ]);

        for (const { slug, updatedAt } of projects) {
          const lastmod = isoDate(updatedAt);
          const loc = `${siteUrl}/projetos/${slug}`;

          if (BOTA_PRA_RODAR_SLUGS.has(slug)) {
            const enLoc = `${siteUrl}/projetos/${slug}_en`;
            const esLoc = `${siteUrl}/projetos/${slug}_es`;
            const alternates: Array<Alternate> = [
              { hreflang: "pt-BR", href: loc },
              { hreflang: "en", href: enLoc },
              { hreflang: "es", href: esLoc },
              { hreflang: "x-default", href: loc },
            ];
            entries.push({
              loc,
              lastmod,
              changefreq: "monthly",
              priority: 0.8,
              alternates,
            });
            entries.push({
              loc: enLoc,
              lastmod,
              changefreq: "monthly",
              priority: 0.7,
              alternates,
            });
            entries.push({
              loc: esLoc,
              lastmod,
              changefreq: "monthly",
              priority: 0.7,
              alternates,
            });
          } else {
            entries.push({
              loc,
              lastmod,
              changefreq: "monthly",
              priority: 0.7,
            });
          }
        }

        // 3. Biciclopedia questions (route: /biciclopedia/$question)
        for (const q of biciclopediaQuestions) {
          entries.push({
            loc: `${siteUrl}/biciclopedia/${q.id}`,
            lastmod: isoDate(q.updatedAt),
            changefreq: "monthly",
            priority: 0.5,
          });
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
          '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.map(renderUrl),
          "</urlset>",
          "",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control":
              "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
