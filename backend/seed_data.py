"""Seed data: Chart of Accounts (COA) standar Indonesia & Pengaturan Pajak default."""

# Chart of Accounts standar (bisa diedit user via halaman Master Akun)
DEFAULT_COA = [
    # ASET
    {"code": "1-10001", "name": "Kas", "category": "Aset", "type": "Kas/Bank", "normal": "debit"},
    {"code": "1-10002", "name": "Bank", "category": "Aset", "type": "Kas/Bank", "normal": "debit"},
    {"code": "1-10003", "name": "Kas Kecil", "category": "Aset", "type": "Kas/Bank", "normal": "debit"},
    {"code": "1-10200", "name": "Uang Muka Karyawan", "category": "Aset", "type": "Uang Muka", "normal": "debit"},
    {"code": "1-10201", "name": "Uang Muka Pembelian", "category": "Aset", "type": "Uang Muka", "normal": "debit"},
    {"code": "1-10300", "name": "Piutang Usaha", "category": "Aset", "type": "Piutang", "normal": "debit"},
    {"code": "1-10400", "name": "PPN Masukan", "category": "Aset", "type": "Pajak Dibayar Dimuka", "normal": "debit"},
    {"code": "1-20001", "name": "Persediaan Barang", "category": "Aset", "type": "Persediaan", "normal": "debit"},
    {"code": "1-30001", "name": "Peralatan Kantor", "category": "Aset", "type": "Aset Tetap", "normal": "debit"},
    {"code": "1-30002", "name": "Kendaraan", "category": "Aset", "type": "Aset Tetap", "normal": "debit"},
    {"code": "1-30003", "name": "Bangunan & Gedung", "category": "Aset", "type": "Aset Tetap", "normal": "debit"},
    {"code": "1-30004", "name": "Aset Dalam Penyelesaian", "category": "Aset", "type": "Aset Tetap", "normal": "debit"},
    # KEWAJIBAN
    {"code": "2-10001", "name": "Hutang Usaha", "category": "Kewajiban", "type": "Hutang", "normal": "kredit"},
    {"code": "2-10002", "name": "Hutang PPh Pasal 21", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    {"code": "2-10003", "name": "Hutang PPh Pasal 22", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    {"code": "2-10004", "name": "Hutang PPh Pasal 23", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    {"code": "2-10005", "name": "Hutang PPh Pasal 4 ayat 2", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    {"code": "2-10006", "name": "Hutang PPh Pasal 15", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    {"code": "2-10007", "name": "Hutang PPh Pasal 26", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    {"code": "2-10100", "name": "PPN Keluaran", "category": "Kewajiban", "type": "Hutang Pajak", "normal": "kredit"},
    # BEBAN
    {"code": "6-10001", "name": "Beban ATK & Perlengkapan Kantor", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10002", "name": "Beban Pantry & Konsumsi", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10003", "name": "Beban Perbaikan & Pemeliharaan", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10004", "name": "Beban Perjalanan Dinas", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10005", "name": "Beban Jasa Profesional", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10006", "name": "Beban Sewa", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10007", "name": "Beban Listrik, Air & Telepon", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10008", "name": "Beban Bahan Praktek / Proyek", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
    {"code": "6-10009", "name": "Beban Lain-lain", "category": "Beban", "type": "Beban Operasional", "normal": "debit"},
]

# Pengaturan pajak default (bisa diubah user via halaman Pengaturan Pajak).
# Referensi tarif umum perpajakan Indonesia. Semua rate dalam persen.
DEFAULT_TAX_SETTINGS = {
    "key": "default",
    "ppn_rate": 11.0,
    "ppn_account": "1-10400",
    "taxes": [
        {"code": "PPN", "name": "PPN Masukan (11%)", "rate": 11.0, "account": "1-10400",
         "kind": "ppn", "desc": "Pajak Pertambahan Nilai atas pembelian barang/jasa dari PKP."},
        {"code": "PPH21", "name": "PPh Pasal 21 (Progresif)", "rate": 5.0, "account": "2-10002",
         "kind": "wht", "mode": "progressive",
         "brackets": [
             {"upto": 60000000, "rate": 5.0},
             {"upto": 250000000, "rate": 15.0},
             {"upto": 500000000, "rate": 25.0},
             {"upto": 5000000000, "rate": 30.0},
             {"upto": None, "rate": 35.0},
         ],
         "desc": "Tarif progresif UU HPP atas Penghasilan Kena Pajak (lapisan 5/15/25/30/35%). Dihitung otomatis dari DPP."},
        {"code": "PPH22", "name": "PPh Pasal 22 (Pembelian Barang)", "rate": 1.5, "account": "2-10003",
         "kind": "wht", "desc": "Pemungutan atas pembelian barang tertentu / impor / oleh bendaharawan."},
        {"code": "PPH23_JASA", "name": "PPh Pasal 23 - Jasa (2%)", "rate": 2.0, "account": "2-10004",
         "kind": "wht", "desc": "Pemotongan 2% atas imbalan jasa teknik/manajemen/konsultan/jasa lain."},
        {"code": "PPH23_SEWA", "name": "PPh Pasal 23 - Sewa selain Tanah/Bangunan (2%)", "rate": 2.0, "account": "2-10004",
         "kind": "wht", "desc": "Pemotongan 2% atas sewa harta selain tanah dan/atau bangunan."},
        {"code": "PPH42_SEWA", "name": "PPh Pasal 4(2) - Sewa Tanah/Bangunan Final (10%)", "rate": 10.0, "account": "2-10005",
         "kind": "wht", "desc": "PPh Final 10% atas sewa tanah dan/atau bangunan."},
        {"code": "PPH42_KONSTRUKSI", "name": "PPh Pasal 4(2) - Jasa Konstruksi Final", "rate": 2.65, "account": "2-10005",
         "kind": "wht", "mode": "tiered",
         "tiers": [
             {"label": "Pelaksana - Kualifikasi Kecil", "rate": 1.75},
             {"label": "Pelaksana - Menengah / Besar", "rate": 2.65},
             {"label": "Pelaksana - Tanpa Kualifikasi", "rate": 4.0},
             {"label": "Perencana / Pengawas - Berkualifikasi", "rate": 3.5},
             {"label": "Perencana / Pengawas - Tanpa Kualifikasi", "rate": 6.0},
         ],
         "desc": "PPh Final jasa konstruksi. Tarif berjenjang sesuai klasifikasi usaha; pilih klasifikasi saat pengajuan."},
        {"code": "PPH15", "name": "PPh Pasal 15 (Pelayaran/Penerbangan)", "rate": 1.2, "account": "2-10006",
         "kind": "wht", "desc": "PPh atas jasa pelayaran/penerbangan dalam negeri (1,2%) dan lainnya."},
        {"code": "PPH26", "name": "PPh Pasal 26 (WP Luar Negeri 20%)", "rate": 20.0, "account": "2-10007",
         "kind": "wht", "desc": "Pemotongan 20% atas penghasilan WP luar negeri (dapat berubah sesuai P3B/tax treaty)."},
    ],
}
