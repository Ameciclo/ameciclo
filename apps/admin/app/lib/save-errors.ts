type Failure =
  | { code: "conflict"; lastAuthor: string | null }
  | { code: "invalid"; problems: string[] }
  | { code: "duplicate"; existingId: number };

export function failureMessage(failure: Failure): string {
  switch (failure.code) {
    case "conflict":
      return `Esta contagem foi alterada por ${failure.lastAuthor ?? "outra pessoa"} desde que você abriu. Recarregue a página.`;
    case "invalid":
      return failure.problems.join(" ");
    case "duplicate":
      return `Já existe uma contagem com esse local, data e variante (nº ${failure.existingId}).`;
  }
}
