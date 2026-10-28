import Link from "next/link";
import { useId } from "react";

import { PageReveal } from "@/components/motion";

/**
 * KepalaBeranda — hero "papan tulis" (chalkboard).
 * Papan hijau berbingkai kayu dengan tulisan kapur: ruang kelas Indonesia
 * sebagai identitas produk administrasi sekolah.
 */
export function KepalaBeranda() {
  const patternId = `papan-grid-${useId().replaceAll(":", "")}`;

  return (
    <PageReveal
      as="section"
      className="papan-board relative isolate overflow-hidden rounded-2xl"
    >
      {/* Grid kapur samar di permukaan papan */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-papan-foreground/[0.06]"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="none"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 25 H50 M25 0 V50" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <div className="relative px-6 py-12 sm:px-12 sm:py-16">
        <p className="font-mono text-sm text-papan-foreground/70">
          Selamat datang di
        </p>

        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-papan-foreground sm:text-6xl">
          EduAdmin Pro <span className="text-kapur">Premium</span>
        </h1>

        {/* Garis kapur bawah judul */}
        <svg
          aria-hidden="true"
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
          className="mt-4 block h-3 w-56 text-kapur sm:w-72"
        >
          <path
            d="M2 8 C 40 2, 80 10, 120 6 S 200 2, 298 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>

        <p className="mt-6 max-w-prose text-pretty text-base text-papan-foreground/80 sm:text-lg">
          Satu produk untuk mengelola administrasi Satuan Pendidikan Anda:
          Peserta Didik, Nilai, E-Raport, Bank Soal, Perangkat Ajar, hingga
          Absensi QR.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/dashboard"
            className="rounded-lg border-2 border-papan-foreground/80 px-6 py-3 font-semibold text-papan-foreground transition-colors hover:bg-papan-foreground hover:text-papan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kapur focus-visible:ring-offset-2 focus-visible:ring-offset-papan"
          >
            Masuk ke Dashboard
          </Link>
          <Link
            href="/panduan"
            className="rounded-sm py-3 font-medium text-papan-foreground/90 underline decoration-papan-foreground/40 decoration-2 underline-offset-4 hover:decoration-papan-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kapur focus-visible:ring-offset-2 focus-visible:ring-offset-papan"
          >
            Tur Awal
          </Link>
        </div>

        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
          {[
            { k: "Modul", v: "7" },
            { k: "Bahasa", v: "Indonesia" },
            { k: "Konteks", v: "Aktif" },
          ].map((s) => (
            <div key={s.k} className="flex items-baseline gap-2">
              <dt className="text-papan-foreground/60">{s.k}</dt>
              <dd className="font-semibold text-papan-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Rak kapur — dekoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 bottom-0 hidden h-4 sm:block"
      >
        <span className="absolute bottom-1 right-24 block h-1 w-28 rounded-full bg-papan-foreground/20" />
        <span className="absolute bottom-2 right-28 block h-1.5 w-8 -rotate-2 rounded-full bg-papan-foreground/80" />
        <span className="absolute bottom-2 right-40 block h-1.5 w-10 rotate-1 rounded-full bg-kapur/90" />
      </div>
    </PageReveal>
  );
}
