import type { Locale } from "./seo";

const I18N_SUFFIX = /_(en|es)$/;

export function detectLocale(pathname: string): Locale {
  const match = pathname.match(I18N_SUFFIX);
  if (!match) return "pt-BR";
  return match[1] as Locale;
}

export function stripLocaleSuffix(slug: string): string {
  return slug.replace(I18N_SUFFIX, "");
}

export function buildHreflangAlternates(basePath: string) {
  const clean = stripLocaleSuffix(basePath);
  return [
    { lang: "pt-BR" as const, href: clean },
    { lang: "en" as const, href: `${clean}_en` },
    { lang: "es" as const, href: `${clean}_es` },
    { lang: "x-default" as const, href: clean },
  ];
}
