// ======================================
// SAMPLE DATA UMKM ANALYTICS DASHBOARD
// ======================================

// Data transaksi penjualan
var transactions = [
    { id: "TRX-023", date: "2026-11-14", displayDate: "14 Nov 2026, 16:30", product: "Gula Pasir 1kg (x4)", customer: "Intan", quantity: 4, total: 68000, status: "Menunggu", category: "Sembako", method: "Transfer" },
    { id: "TRX-022", date: "2026-11-10", displayDate: "10 Nov 2026, 14:15", product: "Air Mineral (x15)", customer: "Nanda", quantity: 15, total: 60000, status: "Selesai", category: "Minuman", method: "Tunai" },
    { id: "TRX-021", date: "2026-11-02", displayDate: "02 Nov 2026, 10:20", product: "Beras Premium 5kg (x3)", customer: "Dimas", quantity: 3, total: 225000, status: "Selesai", category: "Sembako", method: "QRIS" },
    { id: "TRX-020", date: "2026-10-18", displayDate: "18 Okt 2026, 15:45", product: "Minyak Goreng 2L (x6)", customer: "Rara", quantity: 6, total: 210000, status: "Selesai", category: "Sembako", method: "Tunai" },
    { id: "TRX-019", date: "2026-10-04", displayDate: "04 Okt 2026, 11:30", product: "Sabun Mandi (x10)", customer: "Yudi", quantity: 10, total: 120000, status: "Selesai", category: "Kebutuhan Rumah", method: "Tunai" },
    { id: "TRX-018", date: "2026-09-15", displayDate: "15 Sep 2026, 13:00", product: "Beras Premium 5kg (x4)", customer: "Wati", quantity: 4, total: 300000, status: "Selesai", category: "Sembako", method: "QRIS" },
    { id: "TRX-017", date: "2026-09-02", displayDate: "02 Sep 2026, 09:20", product: "Kopi Sachet (x20)", customer: "Bayu", quantity: 20, total: 100000, status: "Selesai", category: "Minuman", method: "Tunai" },
    { id: "TRX-016", date: "2026-08-20", displayDate: "20 Agu 2026, 17:10", product: "Minyak Goreng 2L (x4)", customer: "Putri", quantity: 4, total: 140000, status: "Selesai", category: "Sembako", method: "Transfer" },
    { id: "TRX-015", date: "2026-08-06", displayDate: "06 Agu 2026, 12:40", product: "Beras Premium 5kg (x6)", customer: "Tono", quantity: 6, total: 450000, status: "Selesai", category: "Sembako", method: "Tunai" },
    { id: "TRX-014", date: "2026-07-17", displayDate: "17 Jul 2026, 16:05", product: "Air Mineral (x20)", customer: "Rizky", quantity: 20, total: 80000, status: "Selesai", category: "Minuman", method: "QRIS" },
    { id: "TRX-013", date: "2026-07-03", displayDate: "03 Jul 2026, 14:50", product: "Gula Pasir 1kg (x10)", customer: "Dewi", quantity: 10, total: 170000, status: "Selesai", category: "Sembako", method: "Tunai" },
    { id: "TRX-012", date: "2026-06-22", displayDate: "22 Jun 2026, 11:15", product: "Sabun Mandi (x8)", customer: "Nina", quantity: 8, total: 96000, status: "Selesai", category: "Kebutuhan Rumah", method: "Tunai" },
    { id: "TRX-011", date: "2026-06-08", displayDate: "08 Jun 2026, 10:30", product: "Beras Premium 5kg (x5)", customer: "Fajar", quantity: 5, total: 375000, status: "Selesai", category: "Sembako", method: "QRIS" },
    { id: "TRX-010", date: "2026-05-19", displayDate: "19 Mei 2026, 15:20", product: "Kopi Sachet (x15)", customer: "Rina", quantity: 15, total: 75000, status: "Selesai", category: "Minuman", method: "Tunai" },
    { id: "TRX-009", date: "2026-05-04", displayDate: "04 Mei 2026, 13:40", product: "Minyak Goreng 2L (x5)", customer: "Agus", quantity: 5, total: 175000, status: "Selesai", category: "Sembako", method: "Tunai" },
    { id: "TRX-008", date: "2026-04-25", displayDate: "25 Apr 2026, 16:50", product: "Beras Premium 5kg (x3)", customer: "Maya", quantity: 3, total: 225000, status: "Selesai", category: "Sembako", method: "Transfer" },
    { id: "TRX-007", date: "2026-04-09", displayDate: "09 Apr 2026, 09:30", product: "Air Mineral (x12)", customer: "Doni", quantity: 12, total: 48000, status: "Selesai", category: "Minuman", method: "Tunai" },
    { id: "TRX-006", date: "2026-03-21", displayDate: "21 Mar 2026, 14:10", product: "Sabun Mandi (x6)", customer: "Lina", quantity: 6, total: 72000, status: "Selesai", category: "Kebutuhan Rumah", method: "Tunai" },
    { id: "TRX-005", date: "2026-03-07", displayDate: "07 Mar 2026, 11:00", product: "Beras Premium 5kg (x4)", customer: "Rudi", quantity: 4, total: 300000, status: "Selesai", category: "Sembako", method: "QRIS" },
    { id: "TRX-004", date: "2026-02-18", displayDate: "18 Feb 2026, 16:25", product: "Kopi Sachet (x10)", customer: "Dina", quantity: 10, total: 50000, status: "Selesai", category: "Minuman", method: "Tunai" },
    { id: "TRX-003", date: "2026-02-03", displayDate: "03 Feb 2026, 10:15", product: "Gula Pasir 1kg (x5)", customer: "Siti", quantity: 5, total: 85000, status: "Selesai", category: "Sembako", method: "Tunai" },
    { id: "TRX-002", date: "2026-01-12", displayDate: "12 Jan 2026, 13:40", product: "Minyak Goreng 2L (x3)", customer: "Budi", quantity: 3, total: 105000, status: "Selesai", category: "Sembako", method: "Transfer" },
    { id: "TRX-001", date: "2026-01-05", displayDate: "05 Jan 2026, 09:10", product: "Beras Premium 5kg (x2)", customer: "Andi", quantity: 2, total: 150000, status: "Selesai", category: "Sembako", method: "Tunai" }
];

// Data persediaan produk katalog
var products = [
    { id: 1, sku: "SMB-001", name: "Beras Premium 5kg", category: "Sembako", buy: 65000, price: 75000, stock: 45, status: "Aktif", lastUpdated: "22 Nov 2026" },
    { id: 2, sku: "SMB-002", name: "Minyak Goreng 2L", category: "Sembako", buy: 30000, price: 35000, stock: 8, status: "Aktif", lastUpdated: "22 Nov 2026" },
    { id: 3, sku: "SMB-003", name: "Gula Pasir 1kg", category: "Sembako", buy: 14500, price: 17000, stock: 32, status: "Aktif", lastUpdated: "22 Nov 2026" },
    { id: 4, sku: "MNM-001", name: "Kopi Sachet", category: "Minuman", buy: 3800, price: 5000, stock: 25, status: "Aktif", lastUpdated: "22 Nov 2026" },
    { id: 5, sku: "MNM-002", name: "Air Mineral", category: "Minuman", buy: 2800, price: 4000, stock: 65, status: "Aktif", lastUpdated: "22 Nov 2026" },
    { id: 6, sku: "RMT-001", name: "Sabun Mandi", category: "Kebutuhan Rumah", buy: 9500, price: 12000, stock: 12, status: "Aktif", lastUpdated: "22 Nov 2026" }
];

// Jumlah kategori produk
var categories = [
    { name: "Sembako", total: 3 },
    { name: "Minuman", total: 2 },
    { name: "Kebutuhan Rumah", total: 1 }
];
