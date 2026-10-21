import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  local: {
    contagens: r.many.contagem(),
  },
  contagem: {
    local: r.one.local({ from: r.contagem.localId, to: r.local.id, optional: false }),
    movements: r.many.movementCount(),
    observations: r.many.observation(),
    conditions: r.many.condition(),
    annotations: r.many.note(),
    warnings: r.many.importWarning(),
  },
  movementCount: {
    contagem: r.one.contagem({ from: r.movementCount.contagemId, to: r.contagem.id }),
  },
  observation: {
    contagem: r.one.contagem({ from: r.observation.contagemId, to: r.contagem.id }),
    characteristic: r.one.characteristic({
      from: r.observation.characteristicKey,
      to: r.characteristic.key,
    }),
  },
  condition: {
    contagem: r.one.contagem({ from: r.condition.contagemId, to: r.contagem.id }),
  },
  note: {
    contagem: r.one.contagem({ from: r.note.contagemId, to: r.contagem.id }),
  },
  importWarning: {
    contagem: r.one.contagem({ from: r.importWarning.contagemId, to: r.contagem.id }),
  },
  characteristic: {
    parent: r.one.characteristic({
      from: r.characteristic.parentKey,
      to: r.characteristic.key,
      alias: "characteristic_parent",
    }),
    children: r.many.characteristic({ alias: "characteristic_parent" }),
    aliases: r.many.characteristicAlias(),
  },
  characteristicAlias: {
    characteristic: r.one.characteristic({
      from: r.characteristicAlias.characteristicKey,
      to: r.characteristic.key,
    }),
  },
}));
