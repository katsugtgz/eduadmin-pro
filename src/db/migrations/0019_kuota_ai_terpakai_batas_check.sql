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
-- would FAIL validation on any pre-existing offending row, so clamp first.
-- Clamping down to `batas` is the conservative direction: it never grants
-- extra budget, only removes the impossible surplus.
--
-- IDEMPOTENT: the DO block checks pg_constraint before adding; safe to re-run.

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
