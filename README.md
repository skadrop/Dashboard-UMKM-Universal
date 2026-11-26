# UMKM Universal Dashboard & POS System

Sistem manajemen bisnis dan kasir digital terpadu berbasis web yang dirancang khusus untuk operasional pelaku usaha mikro, kecil, dan menengah (UMKM). Aplikasi ini menggabungkan modul analisis penjualan, pengelolaan katalog produk, pengawasan persediaan stok, transaksi kasir (*Point of Sale*), riwayat audit transaksi, hingga pelaporan keuangan dan ekspor data dalam satu antarmuka yang terintegrasi secara *real-time*.

---

## Daftar Isi
- [Ringkasan Proyek](#-ringkasan-proyek)
- [Fitur Utama Saat Ini](#-fitur-utama-saat-ini)
  - [1. Dashboard Overview & Analisis Penjualan](#1-dashboard-overview--analisis-penjualan)
  - [2. Manajemen Produk (Katalog)](#2-manajemen-produk-katalog)
  - [3. Manajemen Persediaan Stok](#3-manajemen-persediaan-stok)
  - [4. Penjualan POS (Kasir Real-Time)](#4-penjualan-pos-kasir-real-time)
  - [5. Riwayat Transaksi (Pusat Audit)](#5-riwayat-transaksi-pusat-audit)
  - [6. Laporan Keuangan & Ekspor Data](#6-laporan-keuangan--ekspor-data)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Direktori](#-struktur-direktori)
- [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
- [Alur Kerja Sinkronisasi Data (*Data Flow*)](#-alur-kerja-sinkronisasi-data-data-flow)
- [Rencana Pengembangan Masa Depan (Roadmap)](#-rencana-pengembangan-masa-depan-roadmap)
- [Panduan Pemeliharaan & Kontribusi](#-panduan-pemeliharaan--kontribusi)

---

## Ringkasan Proyek
Aplikasi ini dikembangkan dengan arsitektur *Single Page Application* (SPA) modular tanpa dependensi *framework* yang rumit (*lightweight* & *high-performance*). Setiap aksi yang terjadi di satu modul—seperti checkout di kasir POS—secara instan memperbarui data stok di modul inventaris, kartu metrik KPI, grafik Chart.js di dashboard, tabel riwayat transaksi, hingga laporan laba/rugi tanpa perlu *page reload*.

---

## Fitur Utama Saat Ini

### 1. Dashboard Overview & Analisis Penjualan
* **Kartu KPI Utama**: Menampilkan Total Pendapatan, Total Transaksi, Total Produk Inventaris, dan Rata-rata Nominal per Transaksi secara otomatis.
* **Grafik Penjualan Bulanan (Chart.js)**: Visualisasi tren omzet per bulan sepanjang tahun berjalan dengan opsi filter periode.
* **Distribusi Kategori Produk**: Donut Chart interaktif yang memperlihatkan proporsi persebaran produk berdasarkan kategori bisnis.
* **Widget Produk Terlaris**: Top 5 produk dengan akumulasi kuantitas terjual dan kontribusi nominal tertinggi.
* **Widget Status Stok Ringkas**: Menampilkan produk berstatus menipis dan habis lengkap dengan indikator badge visual di dashboard dan sidebar.

### 2. Manajemen Produk (Katalog)
* **Katalog Produk Dinamis**: Menampilkan daftar produk lengkap dengan nama, kode SKU, kategori, harga modal/beli, harga jual, stok, dan status aktif/nonaktif.
* **Modal Tambah & Edit Produk**: Antarmuka formulir interaktif untuk mendaftarkan barang baru atau memperbarui data katalog lama.
* **Pencarian & Filter Cepat**: Cari instan berdasarkan nama produk atau SKU, serta filter dropdown per kategori (*Sembako, Minuman, Makanan, dsb.*).
* **Konfirmasi Hapus Produk**: Dialog proteksi sebelum menghapus produk dari inventaris toko.

### 3. Manajemen Persediaan Stok
* **3 Kartu Status Stok**: Rekapitulasi jumlah produk berstatus **Stok Aman** (> 10 unit), **Stok Menipis** (1 - 10 unit), dan **Stok Habis** (0 unit).
* **Pencatatan Mutasi Stok**: Tombol `Catat Stok Masuk` (kulakan / restock) dan `Catat Stok Keluar` (penyesuaian / kerusakan / konsumsi) yang langsung memutasi angka stok fisik.
* **Aksi Cepat Mutasi per Baris**: Tombol `+ Masuk` dan `- Keluar` pada masing-masing baris tabel untuk pembaruan cepat tanpa berpindah menu.
* **Filter Status Persediaan**: Mempermudah staf gudang melihat produk yang perlu segera dipesan ulang (*restock alert*).

### 4. Penjualan POS (Kasir Real-Time)
* **Katalog Kartu Produk**: Kartu produk visual di panel kiri lengkap dengan indikator stok dan tombol tambah ke keranjang (`+`). Produk habis (*out-of-stock*) otomatis dinonaktifkan.
* **Keranjang Belanja Fleksibel**: Hitung subtotal otomatis, penyesuaian kuantitas (`+` / `-`), dan input diskon khusus.
* **Pilihan Pembayaran & Identitas Pelanggan**: Mendukung metode pembayaran **Tunai**, **QRIS**, dan **Transfer Bank**, serta pencatatan nama pelanggan.
* **Checkout Terintegrasi**: Memvalidasi kecukupan stok, mengurangi stok barang, mencatat transaksi ke urutan teratas, memperbarui KPI, dan memunculkan struk transaksi sukses.

### 5. Riwayat Transaksi (Pusat Audit)
* **Sinkronisasi Langsung dari Kasir**: Transaksi baru yang baru saja diproses langsung muncul di **baris paling atas** tabel audit.
* **Penyaringan & Penelusuran**: Cari transaksi berdasarkan No. Transaksi (ID), nama produk, nama pelanggan, tanggal transaksi, dan status (*Semua, Selesai, Menunggu, Dibatalkan*).
* **Modal Detail Struk**: Tampilan lengkap struk pembelian (ID transaksi, tanggal/waktu, rincian produk, metode bayar, total tagihan).
* **Cetak Struk Transaksi**: Fitur khusus untuk mencetak struk kasir individual via dialog cetak browser (`window.print()`).

### 6. Laporan Keuangan & Ekspor Data
* **4 Kartu Metrik Finansial**:
  * Pendapatan Kotor (Omzet Akumulasi)
  * Estimasi Modal / HPP (Harga Pokok Penjualan ~70%)
  * Estimasi Laba Bersih Operasional (~30%)
  * Total Transaksi Selesai
* **Filter Periode Laporan Dinamis**: Pilihan periode *Hari Ini*, *7 Hari Terakhir*, *Bulan Ini*, dan *Semua Periode*.
* **Tabel Rekapitulasi Ganda**:
  1. *Laporan Produk Terlaris & Keuntungan*: Rincian kuantitas terjual, omzet, dan margin laba per item barang.
  2. *Rekapitulasi Penjualan per Kategori*: Kontribusi nominal dan progres bar persentase per kategori.
* **Cetak / Simpan PDF**: Menggunakan styling cetak teroptimasi (`@media print`) yang otomatis menyembunyikan sidebar, topbar, dan elemen kontrol.
* **Unduh CSV / Excel**: Mengekspor seluruh data penjualan ke format CSV berstandar **UTF-8 BOM** (`\uFEFF`) sehingga langsung terbuka rapi tanpa kerusakan format di Microsoft Excel maupun Google Sheets.

---

## Teknologi yang Digunakan
* **HTML5**: Struktur semantik modular untuk panel dan modal.
* **CSS3**: Sistem desain modern dengan *CSS Custom Properties* (variabel tema), CSS Grid, Flexbox, smooth scroll navigation, dan print stylesheets khusus.
* **JavaScript (ES6+)**: Logika aplikasi berbasis *event-driven*, manipulasi DOM reaktif, dan kalkulasi data matematis.
* **Chart.js (v4.4.1)**: Pustaka grafik interaktif berbasis Canvas untuk visualisasi omzet dan kategori.
* **Font Awesome 6 (Free CDN)**: Ikon visual antarmuka pengguna yang konsisten.
* **Google Fonts**: Tipografi modern (*Inter*, *Plus Jakarta Sans*, dan *Source Code Pro* untuk format monospaced angka/SKU).

---

## Struktur Direktori

```text
Dashboard UMKM/
├── css/
│   └── style.css          # Seluruh styling tema, tata letak, komponen UI, modal, dan @media print
├── js/
│   ├── data.js            # Mock dataset terpusat (produk, kategori, mutasi, dan transaksi)
│   └── dashboard.js       # Otak interaktif (state management, event handler, kalkulasi, rendering)
├── index.html             # Dokumen utama antarmuka pengguna (Single Page Application)
└── README.md              # Dokumentasi lengkap dan panduan proyek
```

---

## Cara Menjalankan Aplikasi

Aplikasi ini bersifat *client-side* murni, sehingga tidak membutuhkan instalasi *runtime* atau server yang rumit untuk pengujian lokal:

### Opsi 1: Buka Langsung di Browser
1. Unduh atau salin (*clone*) repositori ini ke komputer Anda.
2. Buka folder `Dashboard UMKM`.
3. Klik ganda pada file `index.html` untuk langsung membukanya di browser modern pilihan Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Opsi 2: Menggunakan Live Server (Direkomendasikan untuk Pengembangan)
1. Buka folder proyek di teks editor seperti **VS Code**.
2. Gunakan ekstensi **Live Server** (atau jalankan perintah `npx serve .` / `python -m http.server 8000`).
3. Buka URL lokal yang muncul (contoh: `http://localhost:5500`).

---

## Alur Kerja Sinkronisasi Data (*Data Flow*)

```
[Katalog Produk & Stok (data.js)]
           │
           ├───────────────► [Penjualan POS]
           │                        │ (Checkout)
           │                        ▼
           │             1. Potong Stok Produk
           │             2. Unshift ke Array Transaksi
           │                        │
           ▼                        ▼
[Dashboard Overview]     [Riwayat Transaksi]     [Laporan Keuangan]
• KPI Kartu Terupdate    • Baris #1 Transaksi    • Omzet & HPP Bertambah
• Grafik Re-render       • Modal Detail Struk    • Laba Bersih Dihitung
• Status Stok Berubah    • Filter Status Aktif   • Ekspor PDF & CSV Siap
```

---

## Rencana Pengembangan Masa Depan (Roadmap)

Proyek ini dibangun dengan kode yang modular sehingga siap dikembangkan menjadi aplikasi skala produksi (*production-grade*):

- [ ] **Penyimpanan Persisten & Sinkronisasi Cloud**:
  - Migrasi dari data in-memory ke database relasional/NoSQL (misal: PostgreSQL, MySQL, Supabase, atau Cloud Firestore).
  - Implementasi *Local Storage* / *IndexedDB* untuk mode *offline-first*.
- [ ] **Sistem Autentikasi & Hak Akses Pengguna (RBAC)**:
  - Role Kasir (hanya akses modul Penjualan POS dan Riwayat Transaksi).
  - Role Gudang (hanya akses Manajemen Stok dan Katalog Produk).
  - Role Pemilik / Owner (akses penuh termasuk Laporan Keuangan dan Analisis).
- [ ] **Dukungan Perangkat Keras POS**:
  - Integrasi *Web Bluetooth API* / *Web Serial API* untuk mencetak langsung ke Printer Thermal kasir 58mm / 80mm (*ESC/POS*).
  - Pemindaian barcode/QR code menggunakan kamera perangkat (*WebCam Barcode Scanner*) atau barcode scanner USB.
- [ ] **Integrasi Pembayaran Digital Otomatis**:
  - Integrasi Payment Gateway (Midtrans, Xendit, atau Doku) untuk verifikasi pembayaran QRIS otomatis (*webhook callback*).
- [ ] **Multi-Cabang & Multi-Gudang**:
  - Kemampuan mengelola lebih dari satu gerai atau gudang persediaan dalam satu akun dashboard.
- [ ] **Notifikasi & Restock Cerdas**:
  - Notifikasi otomatis melalui WhatsApp atau Email saat persediaan barang mencapai batas minimum.

---

## Panduan Pemeliharaan & Kontribusi

1. **Gaya Kode (*Code Style*)**:
   - Pertahankan penulisan CSS terstruktur menggunakan variabel warna dari `:root`.
   - Hindari manipulasi *state* langsung yang terisolasi; selalu panggil fungsi terpusat `renderAll()` setelah mutasi data agar seluruh komponen layar tetap sinkron.
2. **Penyimpanan Data CSV**:
   - Saat memodifikasi fungsi ekspor CSV, pastikan karakter BOM `\uFEFF` tetap disertakan agar karakter khusus dan format angka desimal tetap terbaca benar di semua versi spreadsheet.

---