/**
 * Decodifica HTML entities para texto normal
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window !== 'undefined') {
    // No cliente, usar DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.documentElement.textContent || text;
  } else {
    // No servidor, fazer decodificação manual das entidades mais comuns
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&aacute;': 'á',
      '&agrave;': 'à',
      '&acirc;': 'â',
      '&atilde;': 'ã',
      '&auml;': 'ä',
      '&eacute;': 'é',
      '&egrave;': 'è',
      '&ecirc;': 'ê',
      '&euml;': 'ë',
      '&iacute;': 'í',
      '&igrave;': 'ì',
      '&icirc;': 'î',
      '&iuml;': 'ï',
      '&oacute;': 'ó',
      '&ograve;': 'ò',
      '&ocirc;': 'ô',
      '&otilde;': 'õ',
      '&ouml;': 'ö',
      '&uacute;': 'ú',
      '&ugrave;': 'ù',
      '&ucirc;': 'û',
      '&uuml;': 'ü',
      '&ccedil;': 'ç',
      '&ntilde;': 'ñ'
    };

    return text.replace(/&[#\w]+;/g, (entity) => {
      return entities[entity] || entity;
    });
  }
}