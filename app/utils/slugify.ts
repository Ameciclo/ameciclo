export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
}

export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Gera slug de contagem no formato: aaaa_mm_dd-nome_da_contagem
 * Ex: "2022-03-30" + "Av. Rui Barbosa x R. Amélia" → "2022_03_30-av_rui_barbosa_x_r_amelia"
 */
export function contagemSlug(date: string, name: string): string {
  const datePart = date.slice(0, 10).replace(/-/g, '_');
  const namePart = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${datePart}-${namePart}`;
}