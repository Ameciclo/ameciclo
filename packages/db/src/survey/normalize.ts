// Cleaning helpers for the cyclist profile survey spreadsheets.

// Values that mean "no answer" (or a spreadsheet error) and become NULL
const NO_ANSWER = new Set([
  "sem resposta",
  "não sabe/não respondeu",
  "nao sabe/nao respondeu",
  "não sabe/sem resposta",
  "na",
  "n/a",
  "-",
  "#n/a",
  "#ref!",
  "#value!",
  "###",
]);

export function isNoAnswer(value: string | null | undefined): boolean {
  if (value == null) return true;
  const t = value.trim().toLowerCase();
  return t === "" || NO_ANSWER.has(t);
}

/** Trims, collapses spaces, drops stray leading quotes/backticks. NULL if empty or "no answer". */
export function cleanText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[`'"´]+/, "")
    .trim();
  return isNoAnswer(t) ? null : t;
}

const SMALL_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"]);

/**
 * Like cleanText, but names typed in ALL CAPS or all lowercase ("CENTRO",
 * "centro") become Title Case, so the same place is not counted three times.
 */
export function cleanPlace(value: string | null | undefined): string | null {
  const t = cleanText(value);
  if (!t) return null;
  const hasLetters = /\p{L}/u.test(t);
  if (hasLetters && (t === t.toUpperCase() || t === t.toLowerCase())) {
    return t
      .toLowerCase()
      .split(" ")
      .map((w, i) =>
        i > 0 && SMALL_WORDS.has(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1),
      )
      .join(" ");
  }
  return t;
}

export function cleanOccupation(
  value: string | null | undefined,
): string | null {
  const t = cleanText(value);
  return t ? t.toLowerCase() : null;
}

/** Integer in [min, max], else null. `bad` reports a non-empty value that was rejected. */
export function parseInteger(
  value: string | null | undefined,
  min: number,
  max: number,
): { value: number | null; bad: boolean } {
  if (isNoAnswer(value)) return { value: null, bad: false };
  const t = (value as string).trim();
  if (!/^-?\d+$/.test(t)) return { value: null, bad: true };
  const n = Number.parseInt(t, 10);
  if (n < min || n > max) return { value: null, bad: true };
  return { value: n, bad: false };
}

/** "Sim"/"Não" (and TRUE/FALSE) to boolean; anything else is unknown. */
export function parseYesNo(value: string | null | undefined): boolean | null {
  if (value == null) return null;
  switch (value.trim().toLowerCase()) {
    case "sim":
    case "true":
      return true;
    case "não":
    case "nao":
    case "false":
      return false;
    default:
      return null;
  }
}

export type DateFormat = "dmy" | "mdy";

function parseParts(
  value: string,
): { a: number; b: number; year: number } | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  return { a: Number(m[1]), b: Number(m[2]), year: Number(m[3]) };
}

/** Which of dd/mm/yyyy and mm/dd/yyyy a set of dates uses, if any value settles it. */
export function inferDateFormat(values: Iterable<string>): DateFormat | null {
  let dmy = 0;
  let mdy = 0;
  for (const v of values) {
    const p = parseParts(v);
    if (!p) continue;
    if (p.a > 12) dmy++;
    else if (p.b > 12) mdy++;
  }
  if (dmy === 0 && mdy === 0) return null;
  return dmy >= mdy ? "dmy" : "mdy";
}

function iso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCMonth() !== month - 1) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * ISO date from "17/02/2017" or "11/13/2017". A value that is valid both ways
 * ("10/11/2021") needs the survey's format; without one it is NULL rather than guessed.
 */
export function parseDate(
  value: string | null | undefined,
  surveyFormat: DateFormat | null,
): string | null {
  if (!value) return null;
  const p = parseParts(value);
  if (!p) return null;
  if (p.a > 12) return iso(p.year, p.b, p.a);
  if (p.b > 12) return iso(p.year, p.a, p.b);
  if (!surveyFormat) return null;
  return surveyFormat === "dmy" ? iso(p.year, p.b, p.a) : iso(p.year, p.a, p.b);
}
