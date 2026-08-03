-- 0019_kuota_ai_terpakai_batas_check.sql
-- Add the kuota_ai_terpakai_batas_check CHECK constraint to the real database.
--
-- The Drizzle schema (src/db/schema.ts) declared this CHECK back in the
-- AC#5 race-hardening commit, but the migration that actually applies it to a
-- provisioned database was never shipped — schema.ts is only the type mirror.
-- This file makes the documented "DB backstop" real: even a buggy caller
-- cannot push `terpakai` past `batas`.
--
-- PRE-CLAMP: the old `tambahPemakaianKuota` (read-then-write) provably allowed
-- `terpakai > batas` under concurrent increments. A plain
--   ALTER TABLE kuota_ai ADD CONSTRAINT ... CHECK (terpakai <= batas)
-- would FAIL validation on any pre-existing offending row, so offending rows
-- must be reconciled first. Clamping down to `batas` is the conservative
-- direction (it never grants extra budget, only removes the impossible
-- surplus), but doing it blindly would destroy the record of how far over the
-- historical usage went. Instead: snapshot every offender into a side
-- reconciliation table BEFORE clamping, so the overage is preserved for audit
-- and never silently rewritten. Operators inspect
-- `kuota_ai_overage_audit_0019` to reconcile; an empty table means no overage
-- was present at migration time.
--
-- IDEMPOTENT:
--   - the audit table uses CREATE TABLE IF NOT EXISTS;
--   - the snapshot only selects rows still over `batas` (after the first run
--     there are none, so a re-run inserts 0 rows — no duplicate audit entries);
--   - the DO block checks pg_constraint before adding; safe to re-run.

create table if not exists kuota_ai_overage_audit_0019 (
  audit_id        bigint generated always as identity primary key,
  tenant_id       text        not null,
  tahun_ajaran_id uuid        not null,
  semester        text        not null,
  terpakai_before integer     not null,
  batas           integer     not null,
  overage         integer     not null,
  audited_at      timestamptz not null default now()
);

insert into kuota_ai_overage_audit_0019
  (tenant_id, tahun_ajaran_id, semester, terpakai_before, batas, overage)
select tenant_id, tahun_ajaran_id, semester, terpakai, batas, terpakai - batas
  from kuota_ai
  where terpakai > batas;

-- Clamp now that the overage is recorded. Conservative direction only.
update kuota_ai set terpakai = batas where terpakai > batas;

do $$
begin
  if not exists (
    select 1 from pg_constraint
      where conname = 'kuota_ai_terpakai_batas_check'
        and conrelid = 'kuota_ai'::regclass
  ) then
    alter table kuota_ai
      add constraint kuota_ai_terpakai_batas_check check (terpakai <= batas);
  end if;
end $$;
