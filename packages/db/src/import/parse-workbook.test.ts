import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseWorkbook } from "./parse-workbook";

// The source spreadsheets are not committed, so these tests run only where
// `data/contagens` has been downloaded. Reading all of them takes over a minute,
// so that part runs with `pnpm test:fixtures`.
const dir = resolve(import.meta.dirname, "../../../../data/contagens");
const manifestPath = resolve(dir, "manifest.json");
const entries: { fileId: string; title: string }[] = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : [];
const available = entries.filter((e) => existsSync(resolve(dir, `${e.fileId}.xlsx`)));

const everyFile = Boolean(process.env.CONTAGENS_FIXTURES);

const parse = (fileId: string) => parseWorkbook(new Uint8Array(readFileSync(resolve(dir, `${fileId}.xlsx`))));

describe.skipIf(available.length === 0)("parseWorkbook on the real spreadsheets", () => {
  it.skipIf(!everyFile).each(available.map((e) => [e.title, e.fileId]))("reads %s", async (_title, fileId) => {
    const parsed = await parse(fileId);
    expect(parsed.name).not.toBe("");
    expect(parsed.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parsed.approaches.length).toBeGreaterThanOrEqual(2);
    expect(parsed.warnings.filter((w) => w.severity === "error")).toEqual([]);
    if (parsed.positions) {
      expect(parsed.positions).toHaveLength(parsed.approaches.length);
      expect(new Set(parsed.positions).size).toBe(parsed.positions.length);
    }
  });

  it("keeps the published totals of the 2026 Rufino x Natário count", async () => {
    const entry = available.find((e) => e.title.includes("Rufino"));
    if (!entry) return;
    const parsed = await parse(entry.fileId);
    expect(parsed.date).toBe("2026-03-25");
    expect(parsed.totalCyclists).toBe(1808);
    expect(parsed.peakBucketCount).toBe(226);
    expect(parsed.topology).toBe("crossroad");
    expect(parsed.positions).toEqual(["N", "E", "S", "W"]);
  });
});
