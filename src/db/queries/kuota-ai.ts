/**
 * Data-access layer over the kuota_ai table (per-tenant per-period AI budget).
 * Pure repository functions — no authz logic, no validation, no audit. Composed
 * by the action layer.
 *
 * §13 isolation invariant: every query runs inside
 * `withTenant(db, tenantId, tx => fn(tx, ...))`. RLS scopes all rows to the
 * tenant set in the session GUC `app.tenant_id`. `tenant_id` is NEVER passed
 * as a function argument — it always defaults from the GUC.
 *
 * AC#5 BUDGET ENFORCEMENT (split across layers, TOCTOU-safe): this repo
 * exposes the primitives — read (`getKuotaAi`), find-or-create
 * (`getAtauBuatKuotaAi`), increment (`tambahPemakaianKuota`). The ATOMIC gate
 * lives in `tambahPemakaianKuota`: it issues a conditional UPDATE
 * (`SET terpakai = terpakai + 1 WHERE terpakai < batas RETURNING *`) and throws
 * `Kuota AI habis.` when 0 rows match (quota exhausted OR the row is RLS-hidden
 * / missing — the action layer always calls `getAtauBuatKuotaAi` first, so a
 * missing row is a deny, not a normal path). The row lock the UPDATE takes
 * serializes concurrent increments under READ COMMITTED, so N concurrent
 * transactions cannot all pass the gate. The action layer additionally keeps
 * an early `tersisa <= 0` read as a UX fast-path; the repo UPDATE is the source
 * of truth. The `kuota_ai_terpakai_batas_check` CHECK (`terpakai <= batas`) is
 * the DB backstop.
 *
 * `InfoKuotaAi` is the derived read shape: `tersisa = batas - terpakai`,
 * computed here so callers never have to re-derive it.
 */
import { and, eq, sql } from "drizzle-orm";

import type { Db, Tx } from "../client";
import { kuotaAi } from "../schema";

/** Semester mirrors the schema CHECK constraint: ganjil (odd) / genap (even). */
export type Semester = "ganjil" | "genap";

/**
 * Derived quota info returned to callers. `tersisa` is computed here
 * (`batas - terpakai`) so the action layer can read it without re-deriving.
 */
export interface InfoKuotaAi {
  readonly terpakai: number;
  readonly batas: number;
  readonly tersisa: number;
}

/**
 * Read the kuota_ai row for (tahunAjaranId, semester) within the current
 * tenant (RLS-scoped) and return the derived info. Returns null when no row
 * exists — the action layer decides whether that means "unlimited" or
 * "batas=0"; the repo treats absence as absence.
 */
export async function getKuotaAi(
  db: Db | Tx,
  tahunAjaranId: string,
  semester: Semester
): Promise<InfoKuotaAi | null> {
  const rows = await db
    .select()
    .from(kuotaAi)
    .where(
      and(
        eq(kuotaAi.tahunAjaranId, tahunAjaranId),
        eq(kuotaAi.semester, semester)
      )
    );
  const row = rows[0];
  if (!row) return null;
  return {
    terpakai: row.terpakai,
    batas: row.batas,
    tersisa: row.batas - row.terpakai,
  };
}

/**
 * AC#5 find-or-create. If a kuota_ai row exists for (tahunAjaranId, semester)
 * under the current tenant, return its info. Otherwise INSERT a fresh row with
 * `terpakai=0` (schema default) and `batas=batasDefault ?? 100` (schema
 * default is 100). Returns the info either way. The action layer typically
 * calls this at request time to guarantee a quota row exists before reading
 * `tersisa`.
 *
 * CONFLICT-SAFE: two concurrent requests for the same (tenant, tahunAjaranId,
 * semester) can both observe no row and race on INSERT. The plain INSERT would
 * throw a unique-violation on the loser, aborting the outer transaction. Use
 * `onConflictDoNothing` on `kuota_ai_tenant_ta_semester_unique`; if the INSERT
 * lost the race (0 rows returned), re-read the winner's row.
 */
export async function getAtauBuatKuotaAi(
  db: Db | Tx,
  tahunAjaranId: string,
  semester: Semester,
  batasDefault?: number
): Promise<InfoKuotaAi> {
  const existing = await getKuotaAi(db, tahunAjaranId, semester);
  if (existing) return existing;

  const batas = batasDefault ?? 100;
  const inserted = await db
    .insert(kuotaAi)
    .values({ tahunAjaranId, semester, batas })
    .onConflictDoNothing({ target: [kuotaAi.tenantId, kuotaAi.tahunAjaranId, kuotaAi.semester] })
    .returning();
  if (inserted.length === 1) {
    const row = inserted[0];
    return {
      terpakai: row.terpakai,
      batas: row.batas,
      tersisa: row.batas - row.terpakai,
    };
  }
  // 0 rows means onConflictDoNothing matched a concurrent insert; re-read.
  const after = await getKuotaAi(db, tahunAjaranId, semester);
  if (after) return after;
  throw new Error("Kuota AI tidak dapat dibuat (konflik atau RLS).");
}

/**
 * AC#5 atomic increment + gate. Issues a single conditional UPDATE that bumps
 * `terpakai` by 1 ONLY when `terpakai < batas`, and returns the updated info.
 * The row-level lock taken by the UPDATE serializes concurrent increments on
 * the same row under READ COMMITTED, so N concurrent transactions cannot all
 * pass the gate (closes the TOCTOU window the old read-then-write had).
 *
 * Throws `"Kuota AI habis."` when 0 rows are updated, which happens when:
 *   - `terpakai >= batas` (quota exhausted — the normal reject path), OR
 *   - no row matches `(tahunAjaranId, semester)` under RLS (cross-tenant access
 *     is hidden, and the caller did not call `getAtauBuatKuotaAi` first).
 *
 * The schema `kuota_ai_terpakai_batas_check` (`terpakai <= batas`) is the DB
 * backstop: even a buggy caller cannot push `terpakai` past `batas`. The action
 * layer keeps an early `tersisa <= 0` read as a UX fast-path; this UPDATE is the
 * source of truth.
 */
export async function tambahPemakaianKuota(
  db: Db | Tx,
  tahunAjaranId: string,
  semester: Semester
): Promise<InfoKuotaAi> {
  const rows = await db
    .update(kuotaAi)
    .set({ terpakai: sql`${kuotaAi.terpakai} + 1` })
    .where(
      and(
        eq(kuotaAi.tahunAjaranId, tahunAjaranId),
        eq(kuotaAi.semester, semester),
        sql`${kuotaAi.terpakai} < ${kuotaAi.batas}`
      )
    )
    .returning();

  if (rows.length === 0) {
    throw new Error("Kuota AI habis.");
  }
  const row = rows[0];
  return {
    terpakai: row.terpakai,
    batas: row.batas,
    tersisa: row.batas - row.terpakai,
  };
}
