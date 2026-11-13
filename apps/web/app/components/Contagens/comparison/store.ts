import { useSyncExternalStore } from "react";
import { z } from "zod";
import { MAX_COMPARE } from "./constants";
import { addItem, CompareItemSchema, normalizeItems, removeItem, type CompareItem } from "./selection";

// Counts picked for comparison, kept for the browser tab. A tiny external store, so any
// component can read it without a provider and without effects.

const KEY = "ameciclo:contagens:comparar";
const EMPTY: readonly CompareItem[] = [];
const StoredSchema = z.array(CompareItemSchema);

let current: readonly CompareItem[] | null = null;
const listeners = new Set<() => void>();

function load(): readonly CompareItem[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = StoredSchema.safeParse(raw ? JSON.parse(raw) : []);
    return parsed.success ? normalizeItems(parsed.data) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function read(): readonly CompareItem[] {
  current ??= load();
  return current;
}

function write(next: readonly CompareItem[]) {
  if (next === current) return;
  current = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked; the selection then lives only until the page closes.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export const compareSelection = {
  add(item: CompareItem): boolean {
    const result = addItem(read(), item);
    write(result.items);
    return result.changed;
  },
  remove(slug: string) {
    write(removeItem(read(), slug));
  },
  toggle(item: CompareItem) {
    if (read().some((i) => i.slug === item.slug)) compareSelection.remove(item.slug);
    else compareSelection.add(item);
  },
  replace(items: readonly CompareItem[]) {
    write(normalizeItems(items));
  },
  clear() {
    write(EMPTY);
  },
};

// The server and the first client render see an empty selection, so hydration matches.
export function useCompareSelection(): readonly CompareItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const isFull = (items: readonly CompareItem[]) => items.length >= MAX_COMPARE;
