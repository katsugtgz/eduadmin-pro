import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import BerandaPage from "./page";

/**
 * Landing (BerandaPage) smoke + structure tests.
 *
 * NOTE on ISSUE-002 (React "unique key prop" warning):
 * The original offender — `<TextStagger lines={[ <>…</> ]} />`, an unkeyed
 * array-literal fragment passed as a prop — only trips React's
 * `warnForMissingKey` inside the RSC *flight serializer*
 * (`react-server-dom-webpack`). It does NOT fire under `react-dom/server`
 * `renderToString` nor under jsdom client rendering (verified: both report
 * zero warnings even with the bug present). It therefore cannot be asserted
 * by a Vitest unit test in this repo — the regression guard is smoke-tested
 * via browser automation, which checks the browser/server console for
 * `unique "key"` after a fresh `/` load.
 *
 * What we *can* lock in here is that the landing renders its hero and module
 * surface without throwing and that the fixed `TextStagger` usage still
 * produces the brand headline.
 */
describe("BerandaPage (landing)", () => {
  it("renders the hero brand headline and primary CTA", () => {
    render(<BerandaPage />);

    // The TextStagger hero renders the brand name across its line(s).
    expect(
      screen.getByRole("heading", { level: 1, name: /eduadmin pro/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /masuk ke dashboard/i }),
    ).toBeInTheDocument();
  });

  it("routes every MVP module card to its matching module", () => {
    render(<BerandaPage />);

    const expectedRoutes = new Map([
      ["Buka Profil Saya", "/dashboard/pengaturan"],
      ["Buka Pengaturan Sekolah", "/dashboard/pengaturan"],
      ["Buka Peserta Didik", "/dashboard/peserta-didik"],
      ["Buka Input Nilai & E-Raport", "/dashboard/penilaian"],
      ["Buka Bank Soal", "/dashboard/bank-soal"],
      ["Buka Perangkat Ajar", "/dashboard/perangkat-ajar"],
      ["Buka Absensi QR", "/dashboard/absensi"],
    ]);

    for (const [name, href] of expectedRoutes) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });
});
