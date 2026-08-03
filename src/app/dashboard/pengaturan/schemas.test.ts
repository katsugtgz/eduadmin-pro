import { describe, expect, it } from "vitest";
import {
  ProfilSatuanPendidikanSchema,
  PengaturanSatuanPendidikanSchema,
} from "./schemas";

describe("ProfilSatuanPendidikanSchema (#5)", () => {
  it("accepts minimal valid profil", () => {
    const parsed = ProfilSatuanPendidikanSchema.parse({
      nama: "SMP Negeri 1",
      jenjang: "SMP",
    });
    expect(parsed.nama).toBe("SMP Negeri 1");
    expect(parsed.jenjang).toBe("SMP");
  });

  it("rejects missing nama", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({ jenjang: "SMP" }),
    ).toThrow();
  });

  it("rejects empty nama", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({ nama: "   ", jenjang: "SMP" }),
    ).toThrow();
  });

  it("rejects invalid jenjang", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({ nama: "TK Cahaya", jenjang: "TK" }),
    ).toThrow();
  });

  it("rejects non-digit npsn", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({
        nama: "SMP Negeri 1",
        jenjang: "SMP",
        npsn: "abc",
      }),
    ).toThrow();
  });

  it("rejects too-long npsn", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({
        nama: "SMP Negeri 1",
        jenjang: "SMP",
        npsn: "123456789",
      }),
    ).toThrow();
  });

  it("accepts a valid https logoUrl", () => {
    const parsed = ProfilSatuanPendidikanSchema.parse({
      nama: "SMP Negeri 1",
      jenjang: "SMP",
      logoUrl: "https://cdn.example.com/logo.png",
    });
    expect(parsed.logoUrl).toBe("https://cdn.example.com/logo.png");
  });

  it("accepts an empty string logoUrl", () => {
    const parsed = ProfilSatuanPendidikanSchema.parse({
      nama: "SMP Negeri 1",
      jenjang: "SMP",
      logoUrl: "",
    });
    expect(parsed.logoUrl).toBe("");
  });

  it("accepts a missing logoUrl (optional)", () => {
    const parsed = ProfilSatuanPendidikanSchema.parse({
      nama: "SMP Negeri 1",
      jenjang: "SMP",
    });
    expect(parsed.logoUrl).toBeUndefined();
  });

  it("rejects an http:// logoUrl", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({
        nama: "SMP Negeri 1",
        jenjang: "SMP",
        logoUrl: "http://insecure.example.com/logo.png",
      }),
    ).toThrow(/https/i);
  });

  it("rejects a javascript: logoUrl (URL scheme attack)", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({
        nama: "SMP Negeri 1",
        jenjang: "SMP",
        logoUrl: "javascript:alert(1)",
      }),
    ).toThrow(/https/i);
  });

  it("rejects a data: logoUrl (URL scheme attack)", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({
        nama: "SMP Negeri 1",
        jenjang: "SMP",
        logoUrl: "data:image/png;base64,xxx",
      }),
    ).toThrow(/https/i);
  });

  it("rejects a malformed https://-prefixed logoUrl with a space in the host", () => {
    expect(() =>
      ProfilSatuanPendidikanSchema.parse({
        nama: "SMP Negeri 1",
        jenjang: "SMP",
        logoUrl: "https://example .com/logo.png",
      }),
    ).toThrow();
  });
});

describe("PengaturanSatuanPendidikanSchema (#5)", () => {
  it("accepts minimal valid pengaturan with defaults", () => {
    const parsed = PengaturanSatuanPendidikanSchema.parse({
      tahunAjaran: "2026/2027",
      semester: "ganjil",
    });
    expect(parsed.tahunAjaran).toBe("2026/2027");
    expect(parsed.semester).toBe("ganjil");
    expect(parsed.zonaWaktu).toBe("Asia/Jakarta");
    expect(parsed.cetakPaperSize).toBe("a4");
    expect(parsed.cetakTampilkanLogo).toBe(true);
    expect(parsed.cetakTampilkanHeader).toBe(true);
  });

  it("rejects tahunAjaran without slash", () => {
    expect(() =>
      PengaturanSatuanPendidikanSchema.parse({
        tahunAjaran: "2026",
        semester: "ganjil",
      }),
    ).toThrow();
  });

  it("rejects non-digit tahunAjaran", () => {
    expect(() =>
      PengaturanSatuanPendidikanSchema.parse({
        tahunAjaran: "abcd/efgh",
        semester: "ganjil",
      }),
    ).toThrow();
  });

  it("rejects invalid semester", () => {
    expect(() =>
      PengaturanSatuanPendidikanSchema.parse({
        tahunAjaran: "2026/2027",
        semester: "Fall",
      }),
    ).toThrow();
  });

  it("rejects invalid cetakPaperSize (MVP allows only A4/F4)", () => {
    expect(() =>
      PengaturanSatuanPendidikanSchema.parse({
        tahunAjaran: "2026/2027",
        semester: "ganjil",
        cetakPaperSize: "letter",
      }),
    ).toThrow();
  });
});
