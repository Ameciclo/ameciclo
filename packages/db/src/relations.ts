import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  local: {
    contagens: r.many.contagem(),
  },
  contagem: {
    local: r.one.local({ from: r.contagem.localId, to: r.local.id, optional: false }),
    warnings: r.many.importWarning(),
    revisions: r.many.contagemRevision(),
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
  contagemRevision: {
    contagem: r.one.contagem({ from: r.contagemRevision.contagemId, to: r.contagem.id }),
  },
  profileSurvey: {
    interviews: r.many.profileInterview(),
  },
  profileInterview: {
    survey: r.one.profileSurvey({ from: r.profileInterview.surveyId, to: r.profileSurvey.id, optional: false }),
    point: r.one.profilePoint({ from: r.profileInterview.pointId, to: r.profilePoint.id }),
  },
  characteristicAlias: {
    characteristic: r.one.characteristic({
      from: r.characteristicAlias.characteristicKey,
      to: r.characteristic.key,
    }),
  },
}));
