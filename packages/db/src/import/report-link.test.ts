import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { parseWorkbook } from "./parse-workbook";

async function workbookWithReport(value: ExcelJS.CellValue): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  const resumo = wb.addWorksheet("Resumo");
  resumo.addRow(["Cruzamento", "Av. Teste x R. Exemplo"]);
  resumo.addRow(["Data", new Date(Date.UTC(2026, 2, 11))]);
  resumo.addRow(["Relatório", value]);
  return new Uint8Array(await wb.xlsx.writeBuffer());
}

describe("report link in Resumo", () => {
  it("uses the hyperlink address, not the title shown in the cell", async () => {
    const parsed = await parseWorkbook(
      await workbookWithReport({ text: "2023.02.09 - Relatório", hyperlink: "https://docs.google.com/document/d/abc/edit" }),
    );
    expect(parsed.reportUrl).toBe("https://docs.google.com/document/d/abc/edit");
    expect(parsed.warnings.some((w) => w.code === "report_link_invalid")).toBe(false);
  });

  it("accepts a plain address typed in the cell", async () => {
    const parsed = await parseWorkbook(await workbookWithReport("https://drive.google.com/file/d/xyz/view"));
    expect(parsed.reportUrl).toBe("https://drive.google.com/file/d/xyz/view");
  });

  it("drops a placeholder like \"link\" and says so", async () => {
    const parsed = await parseWorkbook(await workbookWithReport('"link"'));
    expect(parsed.reportUrl).toBeNull();
    expect(parsed.warnings.some((w) => w.code === "report_link_invalid")).toBe(true);
  });

  it("stays quiet when the cell is empty", async () => {
    const parsed = await parseWorkbook(await workbookWithReport(null));
    expect(parsed.reportUrl).toBeNull();
    expect(parsed.warnings.some((w) => w.code === "report_link_invalid")).toBe(false);
  });
});
