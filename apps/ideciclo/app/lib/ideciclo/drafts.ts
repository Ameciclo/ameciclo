import { z } from "zod";
import { type IdecicloFormData } from "./form-types";
import { StoredFormSchema, type StoredForm } from "./form-data";

// The evaluation autosaves to this device, tied to the segment, so a lost
// connection or a closed tab costs nothing. Cleared once the form is submitted.

const DraftSchema = z.object({ savedAt: z.string(), data: StoredFormSchema });

const keyOf = (segmentId: string) => `ideciclo-draft:${segmentId}`;

export const loadDraft = (segmentId: string): { savedAt: string; data: StoredForm } | null => {
  try {
    const raw = localStorage.getItem(keyOf(segmentId));
    if (!raw) return null;
    const parsed = DraftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    // Storage blocked or the draft is not JSON: start without it.
    return null;
  }
};

/** Returns when it was saved, or null when the browser refused. */
export const saveDraft = (segmentId: string, data: IdecicloFormData): string | null => {
  const savedAt = new Date().toISOString();
  try {
    localStorage.setItem(keyOf(segmentId), JSON.stringify({ savedAt, data }));
    return savedAt;
  } catch {
    return null;
  }
};

export const clearDraft = (segmentId: string): void => {
  try {
    localStorage.removeItem(keyOf(segmentId));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
};
