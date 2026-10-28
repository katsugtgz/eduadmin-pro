import Link from "next/link";

import { KepalaBeranda } from "@/components/beranda/kepala-beranda";
import { PageReveal } from "@/components/motion";

type Modul = {
  nama: string;
  deskripsi: string;
  href: string;
};

const MVP_MODULES: Modul[] = [
  {
    nama: "Profil Saya",
    deskripsi: "Data pengguna dan kepegawaian Anda.",
    href: "/dashboard/pengaturan",
  },
  {
    nama: "Pengaturan Sekolah",
    deskripsi: "Identitas dan konfigurasi Satuan Pendidikan.",
    href: "/dashboard/pengaturan",
  },
  {
    nama: "Peserta Didik",
    deskripsi:
      "Peserta Didik, Rombongan Belajar, dan mutasi. Kelola data demografi Peserta Didik secara terpusat.",
    href: "/dashboard/peserta-didik",
  },
  {
    nama: "Input Nilai & E-Raport",
    deskripsi: "Penilaian, Nilai Akhir, dan cetak E-Raport.",
    href: "/dashboard/penilaian",
  },
  {
    nama: "Bank Soal",
    deskripsi: "Bank soal dengan komposisi dan taksonomi.",
    href: "/dashboard/bank-soal",
  },
  {
    nama: "Perangkat Ajar",
    deskripsi: "Modul Ajar, ATP, dan bahan ajar terpadu.",
    href: "/dashboard/perangkat-ajar",
  },
  {
    nama: "Absensi QR",
    deskripsi: "Absensi Peserta Didik lewat pemindaian QR.",
    href: "/dashboard/absensi",
  },
];

export default function BerandaPage() {
  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <KepalaBeranda />

      {/* TUR AWAL — catatan pinggir papan */}
      <PageReveal as="section" className="mx-auto w-full max-w-prose text-center">
        <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Tur Awal
        </h2>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Belum pernah memakai EduAdmin Pro Premium? Ikuti tur singkat untuk
          mengenali alur utama sebelum mulai mencatat data Satuan Pendidikan.
        </p>
        <Link
          href="/panduan"
          className="mt-4 inline-block font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-wavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Lihat Panduan Penggunaan
        </Link>
      </PageReveal>

      {/* DAFTAR MODUL — buku induk: baris register, bukan kartu */}
      <section aria-labelledby="modul-judul" className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="modul-judul"
            className="font-display text-4xl tracking-tight text-foreground sm:text-5xl"
          >
            Daftar Modul
          </h2>
          <span className="font-mono text-sm text-muted-foreground">
            7 modul aktif
          </span>
        </div>

        <ul className="border-t-2 border-foreground/80">
          {MVP_MODULES.map((modul) => (
            <li key={modul.nama} className="border-b border-border">
              <Link
                href={modul.href}
                aria-label={`Buka ${modul.nama}`}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 px-2 py-5 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[16rem_1fr] sm:px-4"
              >
                <span className="font-display text-xl tracking-tight text-foreground group-hover:text-accent sm:text-2xl">
                  {modul.nama}
                </span>
                <span className="text-sm text-muted-foreground sm:text-base">
                  {modul.deskripsi}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CATATAN KAKI */}
      <PageReveal
        as="aside"
        aria-label="Catatan kaki"
        className="border-t border-border pt-8"
      >
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Dibuat untuk Guru dan Satuan Pendidikan di Indonesia.</p>
          <p>
            Lihat{" "}
            <Link
              href="/panduan"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              panduan penggunaan
            </Link>{" "}
            untuk selengkapnya.
          </p>
        </div>
      </PageReveal>
    </div>
  );
}
