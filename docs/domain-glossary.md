# Domain Glossary

EduAdmin Pro uses Indonesian education-administration terminology as its canonical domain language. This glossary defines the core terms used throughout the schema, UI, and documentation.

## Tenancy and identity

| Term | Meaning |
|---|---|
| **Satuan Pendidikan** | A school-like institution (SD, SMP, SMA, SMK, madrasah). The primary operational data boundary — every tenant-scoped record belongs to exactly one Satuan Pendidikan. |
| **Pengguna** | A person who signs in and can act in one or more Satuan Pendidikan. |
| **Keanggotaan Satuan Pendidikan** | The membership that grants a Pengguna a role inside one Satuan Pendidikan. |
| **Satuan Pendidikan Aktif** | The school currently selected by a user as the operational context. All tenant-scoped work happens within exactly one active school at a time. |
| **Peran Akses** | An access role granted through membership — Admin Satuan Pendidikan, Guru, Wali Kelas, or Kepala Satuan Pendidikan. Roles are scoped per school; there is no global superuser. |
| **Instansi Pengelola** | An optional organization above one or more schools (e.g. a foundation), used for oversight or purchasing. It never replaces Satuan Pendidikan as the data boundary. |

## People

| Term | Meaning |
|---|---|
| **Peserta Didik** | A learner recorded in one Satuan Pendidikan. Identified by NIS/NISN attributes, but never merged across schools. |
| **Status Peserta Didik** | Learner lifecycle state: Aktif, Pindah, Lulus, or Keluar. Status changes never delete academic history. |
| **Pendidik dan Tenaga Kependidikan (PTK)** | A personnel record for an educator or staff member. A PTK does not automatically imply a login account. |
| **Guru** | A PTK with teaching responsibility inside one school. |
| **Wali Kelas** | A teacher assigned to guide one class group for a specific academic year and semester. |
| **Wali Peserta Didik** | A guardian contact recorded for a learner — administrative contact data, not a login account. |
| **Kepala Satuan Pendidikan** | The official school head, used for school profile, print/signature context, and report cards. |

## Academic structure

| Term | Meaning |
|---|---|
| **Tahun Ajaran / Semester** | The academic year (e.g. 2026/2027) and its subdivision (Ganjil/Genap) — the primary time context for all academic records. |
| **Rombongan Belajar** | A class group of learners within one school for an academic period (e.g. 7A, XII IPA 1). |
| **Tingkat** | Grade level (Kelas 7, Fase E, etc.). Multiple class groups can share one Tingkat. |
| **Penempatan Rombongan Belajar** | The historical placement record connecting a learner to a class group per academic period. Current class is derived from placement, never overwritten on the learner record. |
| **Mata Pelajaran** | A subject area (Matematika, Bahasa Indonesia, PAI, ...). |
| **Beban Mengajar** | A teaching assignment connecting a teacher, subject, and class group or grade level for a specific academic period. |
| **Kurikulum / Capaian Pembelajaran / Tujuan Pembelajaran** | The official curriculum framework, its achievement statements, and derived learning objectives used to plan teaching. |

## Assessment and reporting

| Term | Meaning |
|---|---|
| **Penilaian** | An assessment activity (assignment, quiz, project, test) created by a teacher. |
| **Nilai Peserta Didik** | One learner's result for one assessment. |
| **Nilai Akhir** | The summarized grade used for reporting, always traceable to its contributing assessment results. |
| **E-Raport** | The semester report card for one learner. A **Draf E-Raport** can be reviewed and corrected; an **E-Raport Terbit** is officially issued and can only change through a recorded **Revisi E-Raport** — never a silent edit. |

## Attendance

| Term | Meaning |
|---|---|
| **Absensi Harian** | The daily attendance record for one learner on one school day. |
| **Status Kehadiran** | Attendance state: Hadir, Izin, Sakit, or Alpa. |
| **Absensi QR** | QR-assisted capture for daily attendance — a capture method, not a separate attendance model. |

## Content and AI assistance

| Term | Meaning |
|---|---|
| **Perangkat Ajar** | Teaching planning documents (Modul Ajar, RPP, ATP, Program Semester, ...), classified by **Jenis Perangkat Ajar**. |
| **Butir Soal / Bank Soal / Paket Soal** | An individual question item, the reusable question bank, and an assembled question package for a specific use. |
| **Permintaan AI** | A user request for AI assistance to draft questions, teaching documents, or help answers, with visible states (Diproses, Selesai, Gagal, Dibatalkan). |
| **Draf AI** | An AI-assisted draft that requires human review before use. AI output never becomes official content automatically. |
| **Verifikasi Dokumen AI** | The teacher's confirmation that they reviewed and take responsibility for an AI-assisted document. |

## Data integrity and operations

| Term | Meaning |
|---|---|
| **Riwayat Perubahan / Koreksi Data / Catatan Audit** | Change history, accountable correction of saved data, and the audit trail of who did what, when, and in which school context. |
| **Impor Data / Ekspor Data** | Template-based import with validation and a user-facing result summary; export scoped to the active school. Never silent overwrite or cross-school merge. |
| **Arsip Data / Penghapusan Data** | Important records are archived or removed through controlled deletion; hard delete is exceptional and audited. |
| **Mode Offline / Sinkronisasi Data** | Selected safe tasks (attendance entry, draft grades) work offline; pending local changes are visible and synchronized without silent overwrite, with explicit conflict resolution. |
| **Notifikasi / Pengingat / Tugas Tertunda** | In-app notices, reminders, and pending-work items scoped to the relevant school context. |
