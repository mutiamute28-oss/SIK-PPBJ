# PRD — Sistem Keuangan PT. Sumber Berdaya Bersama (PT. SBB)

## Problem Statement (asli)
Membangun aplikasi sistem keuangan untuk PT. SBB berdasarkan form Excel PPBJ (Permintaan Pengadaan Barang & Jasa). Alur pengadaan barang/jasa mengikuti file Excel. Output utama: **Jurnal Umum** siap input ke **Accurate Online**, lengkap **rincian pajak Indonesia** yang update. Logo tersemat digunakan sebagai identitas sistem.

## User Choices
- Alur end-to-end: PPBJ → PUM/PP → PTUM → Jurnal Umum (bertahap)
- Login + peran (admin, keuangan, approver, user)
- Tarif pajak default (PPN 11%, PPh 23 2%, dll) dengan halaman Pengaturan Pajak yang dapat diubah
- Output Jurnal Umum: tabel di layar + export Excel/CSV
- COA standar Indonesia yang dapat diedit
- Tema warna mengikuti logo (teal #14758a, oranye #f2941f, biru #4a90d9)

## Arsitektur
- Backend: FastAPI + MongoDB (motor). Auth JWT httpOnly cookies + RBAC. `server.py`, `seed_data.py`.
- Frontend: React 19 + Tailwind + shadcn, React Router, sonner. Brand: Plus Jakarta Sans / Inter.

## Personas
- Admin: kelola pengguna, COA, pajak, semua dokumen & jurnal.
- Keuangan: buat/proses dokumen, generate jurnal, export, kelola COA & pajak.
- Approver: menyetujui/menolak dokumen sesuai matriks otorisasi.
- User: mengajukan dokumen.

## Implemented (2026-06)
- Auth lengkap (login, me, refresh, logout, forgot/reset password), RBAC 4 peran, brute-force & rate limit, seed admin (mutiamute28@gmail.com) + demo keuangan.
- Master COA standar Indonesia (editable) + Pengaturan Pajak (PPN & PPh editable).
- Dokumen PPBJ (Rutin/Investasi/Tidak Rutin dengan line items), PUM, PP (panel pajak DPP/PPN/PPh/Faktur), PTUM (settlement uang muka).
- Matriks otorisasi multi-level (User → Kabag Keuangan → Wadir → Direktur).
- Generator Jurnal Umum otomatis dengan logika akuntansi & pajak Indonesia (Debit beban/aset + PPN Masukan, Kredit hutang PPh + kas/bank). Balanced.
- Halaman Jurnal Umum: filter, ringkasan debit/kredit, detail baris, export CSV & Excel format Accurate Online.
- Dashboard ringkasan. Testing agent: 100% backend & frontend pass.

## Backlog
- P1: Format Jurnal sesuai template import Accurate Online spesifik (kolom kustom), export PDF.
- P1: PPh 21 progresif & PPh 4(2) konstruksi berjenjang otomatis.
- P2: Form Kas Kecil & NRP (No Receipt Payment), Anggaran Bulanan, lampiran ATK/Pantry.
- P2: Upload lampiran dokumen (object storage), nomor form kustom, cetak formulir PDF.
- P2: Notifikasi approval, laporan buku besar per akun.
- Cosmetic: render nilai kartu "Total Nilai Pengajuan" bila total 0.

## Next Tasks
- Konfirmasi format kolom import Accurate Online dari user, sesuaikan export.
- Tambah form Kas Kecil & NRP mengikuti Excel.
