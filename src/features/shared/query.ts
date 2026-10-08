import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

export function throwIfError(error: PostgrestError | null, context: string): void {
  if (error) throw new Error(`Failed to load ${context}: ${error.message}`);
}

/** Escapes LIKE wildcards in user-provided search terms. */
export function toIlikePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}
