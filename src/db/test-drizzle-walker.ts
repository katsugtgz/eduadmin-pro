/**
 * Walk a Drizzle SQL tree (the result of `and`/`or`/`eq`/`not`/`sql` etc.) and
 * collect leaf values as strings: column names, raw param values, and operator
 * fragments. Used by TOCTOU race-guard tests to assert that a captured WHERE
 * predicate contains a specific guard (e.g. status='menunggu') — a bare
 * `expect(captured).toBeDefined()` cannot discriminate a regression that
 * drops the guard, because the mock returns [] regardless of the predicate.
 *
 * Avoids JSON.stringify (Drizzle column objects contain a circular `table`
 * back-reference: PgColumn -> PgTable -> PgColumn).
 */
export function extractDrizzleSqlLeaves(node: unknown): string[] {
  const out: string[] = [];
  const seen = new WeakSet<object>();
  const walk = (n: unknown): void => {
    if (n === null || typeof n !== "object") {
      if (typeof n === "string") out.push(n);
      return;
    }
    if (seen.has(n as object)) return;
    seen.add(n as object);

    const obj = n as {
      name?: unknown;
      value?: unknown;
      queryChunks?: unknown[];
    };
    // Column objects expose a `name` (e.g. "status_verifikasi").
    if (typeof obj.name === "string" && obj.name.length > 0) {
      out.push(obj.name);
    }
    // Param objects expose a primitive `value` (e.g. "menunggu").
    if (
      "value" in obj &&
      obj.value !== undefined &&
      typeof obj.value !== "object"
    ) {
      out.push(String(obj.value));
    }
    // StringChunk objects expose `value` as an array of strings.
    if (Array.isArray(obj.value)) {
      for (const s of obj.value) {
        if (typeof s === "string") out.push(s);
      }
    }
    // SQL objects expose `queryChunks` (recurse).
    if (Array.isArray(obj.queryChunks)) {
      for (const chunk of obj.queryChunks) walk(chunk);
    }
  };
  walk(node);
  return out;
}
