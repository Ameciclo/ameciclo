export const SITE_URL = "https://ameciclo.org";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/miniatura-ameciclo-logo.webp`;

export type Locale = "pt-BR" | "en" | "es";

type HreflangAlt = { lang: Locale | "x-default"; href: string };

type SeoInput = {
  title: string;
  description?: string;
  pathname?: string;
  image?: string;
  locale?: Locale;
  noindex?: boolean;
  keywords?: string;
  hreflang?: HreflangAlt[];
  jsonLd?: object | object[];
  type?: "website" | "article" | "event";
};

type MetaTag =
  | { title: string }
  | { charSet: string }
  | { name: string; content: string }
  | { property: string; content: string };

type LinkTag = {
  rel: string;
  href: string;
  hrefLang?: string;
  type?: string;
};

type ScriptTag = {
  type: string;
  children: string;
};

const absoluteUrl = (pathname = "/") =>
  pathname.startsWith("http") ? pathname : `${SITE_URL}${pathname}`;

const DEFAULT_DESCRIPTION =
  "Nesta plataforma você encontra dados sobre mobilidade ativa, produzidos por nós ou pelo poder público, com visualização facilitada para estudantes, jornalistas, cicloativistas, pesquisadoras(es) e pessoas interessadas.";

export function seo(input: SeoInput) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    pathname = "/",
    image = DEFAULT_OG_IMAGE,
    locale = "pt-BR",
    noindex = false,
    keywords,
    hreflang,
    jsonLd,
    type = "website",
  } = input;

  const url = absoluteUrl(pathname);
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:locale", content: locale.replace("-", "_") },
    { property: "og:site_name", content: "Ameciclo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (keywords) meta.push({ name: "keywords", content: keywords });

  const links: LinkTag[] = [{ rel: "canonical", href: url }];

  if (hreflang?.length) {
    for (const alt of hreflang) {
      links.push({
        rel: "alternate",
        hrefLang: alt.lang,
        href: alt.href.startsWith("http") ? alt.href : `${SITE_URL}${alt.href}`,
      });
    }
  }

  const scripts: ScriptTag[] = [];
  if (jsonLd) {
    const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    for (const block of blocks) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(block),
      });
    }
  }

  return { meta, links, scripts };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Ameciclo - Associação Metropolitana de Ciclistas do Recife",
  alternateName: "Ameciclo",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    "https://www.instagram.com/ameciclo/",
    "https://www.facebook.com/ameciclo/",
    "https://twitter.com/ameciclo",
    "https://www.youtube.com/@ameciclo",
  ],
  areaServed: {
    "@type": "Place",
    name: "Região Metropolitana do Recife, Pernambuco, Brasil",
  },
};
