# Mode Offline — MVP Scope

> Source of truth for the **MVP** offline surface. Read before adding any new
> offline producer (a form that queues a draft) or any new sensitive-action
> label.

## 1. MVP scope: read-only by intent

Offline mode is **read-only** for MVP. The hard guarantee is a negative one:

> **No tenant-sensitive mutation may be persisted while `!navigator.onLine`.**

A sensitive mutation attempted offline MUST fail fast with the Bahasa message
`Tidak dapat menyimpan saat offline` (see `PESAN_BLOK_OFFLINE` in `guard.ts`).
The mutation is never queued, never written to localStorage, and never reaches
the server. The user is told to reconnect.

The positive offline surface (a cached read route served from a service worker
when the network is down) is **deferred** — there is no service worker,
Workbox, or `manifest.json` in this repo today. Adding any of those requires
owner approval. The placeholder string for that future surface is
`Data tidak tersedia saat offline`.

## 2. Sensitive-action vocabulary (closed set)

`src/lib/offline/guard.ts` exports `AKSI_SENSITIF` — the closed set of action
slugs that `assertOnline()` blocks offline. The set covers all five sensitive
categories mandated by the offline-hardening brief:

| Category | Slug(s) | Meaning |
|---|---|---|
| Grades | `simpanNilai` | Nilai Peserta Didik writes |
| Attendance | `simpanAbsensi` | Absensi Harian writes |
| Roles | `ubahPeranAkses` | Keanggotaan `roleSlug` / `peran_akses` writes |
| AI requests | `verifikasiDokumenAi`, `verifikasiDrafAi` | AI verification flows |
| Exports | `terbitkanEraport`, `buatDokumenCetak` | Report-card publish + print-document creation |

**Adding a slug is a scope change.** Open an issue, update this table in the
same commit, and add a regression test to `guard.test.ts`.

## 3. How to use the guard

Every client entrypoint that would otherwise submit a sensitive mutation MUST
call `assertOnline(aksi)` before doing so:

```ts
import { assertOnline } from "@/lib/offline/guard";

async function handleSubmit(formData: FormData) {
  assertOnline("simpanNilai"); // throws Bahasa Error if offline
  await simpanNilaiAction(formData); // only reached when online
}
```

For UI affordances that prefer to grey out a button instead of throwing, use
the predicate form:

```ts
import { bolehAksiSensitif } from "@/lib/offline/guard";

<Button disabled={!bolehAksiSensitif("simpanNilai")} />
```

### Security boundary

The guard is a **client-side affordance**, not the security boundary. The
server-side endpoints re-check connectivity implicitly by being reachable, and
they enforce their own authz (`getAksesSaya().boleh(...)`) + RLS
(`SET LOCAL app.tenant_id`). A determined client can strip the guard; the
server still will not have queued the action because there IS no offline queue
for sensitive actions. The guard exists so honest users get immediate Bahasa
feedback. See `docs/architecture/identity-and-access.md` §12 ("hiding UI is not
authorization").

## 4. What about the draft store + sync queue?

`store.ts` + `sync.ts` are **plumbing only** — a localStorage-backed draft
store (`simpanDraftNilai` / `simpanDraftAbsensi`) and a sync queue
(`syncSekarang`) that drains to `/api/sinkronisasi`. They exist for the
post-MVP optimistic-concurrency offline-draft design (plan #21, AC#1–AC#4).

**For MVP, no production UI produces drafts.** The store is exercised only by:
- `src/components/offline/daftar-perubahan-tertunda.tsx` — the *drain* surface
  (lists pending drafts, exposes "Sinkronkan Sekarang"). It reads the queue; it
  never writes to it.
- Tests.

The offline hardening **does not** repurpose the store for sensitive drafts —
it ensures that when a future UI wires a sensitive mutation, the guard throws
before the store is ever reached. Wiring a producer that bypasses the guard
(i.e. calling `simpanDraftNilai` without first passing `assertOnline`) is a
violation of this scope.

## 5. What is explicitly deferred (post-MVP)

- **Service worker / Workbox / `manifest.json`** — none installed. The
  read-only offline cache (cached route served when offline) depends on this
  and is gated on owner approval.
- **Background sync** — no Background Sync API usage; `syncSekarang` runs only
  when the user clicks "Sinkronkan Sekarang" while online.
- **Offline drafts for sensitive data** — the store's `simpanDraft*` helpers
  remain in the codebase for the post-MVP optimistic-concurrency design, but
  MVP UIs MUST NOT call them for the categories in §2. The guard enforces this.
- **Conflict resolution UI for offline-editable categories** — N/A for MVP
  because no sensitive category is offline-editable.

## 6. Test posture

- `guard.test.ts` — exhaustive proof that every `AKSI_SENSITIF` slug throws
  offline with `PESAN_BLOK_OFFLINE`, and that the message contains the exact
  Bahasa spec string.
- `store.test.ts`, `sync.test.ts` — cover the plumbing in isolation; they do
  NOT constitute permission to wire producers. They exist so the post-MVP
  design can land without re-greenfielding the queue.
- Playwright offline simulation (`context.setOffline(true)`) is the intended
  end-to-end proof, but the Playwright tracer skips without
  `E2E_AUTH_EMAIL` / `E2E_AUTH_PASSWORD`. Until those are provisioned, the
  vitest guard tests are the authoritative block-proof.
