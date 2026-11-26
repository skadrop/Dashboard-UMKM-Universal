// ==========================================
// UMKM ANALYTICS DASHBOARD - CORE LOGIC
// ==========================================

// State internal
var posCart = [];
var posActiveCategory = 'Semua';
var posSelectedPayment = 'Tunai';
var currentSelectedTrx = null;
var pendingDeleteProductId = null;

// Helpers
function formatRp(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var el = document.createElement('div');
    el.className = 'toast-item ' + type;
    var iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info';
    el.innerHTML = '<i class="' + iconClass + '"></i><span>' + message + '</span>';
    container.appendChild(el);

    setTimeout(function () {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'all 0.3s ease';
        setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 300);
    }, 3200);
}

// ==========================================
// 1. DASHBOARD OVERVIEW & KPIS
// ==========================================

function getFilteredTransactions() {
    var periodFilter = document.getElementById('periodFilter');
    var val = periodFilter ? periodFilter.value : 'all';
    if (!val || val === 'all') return transactions;
    return transactions.filter(function (t) {
        return t.date && t.date.indexOf(val) === 0;
    });
}

function updateKPI() {
    var filtered = getFilteredTransactions();
    var completedTrx = filtered.filter(function (t) { return t.status === 'Selesai'; });

    var totalRevenue = completedTrx.reduce(function (sum, t) { return sum + Number(t.total || 0); }, 0);
    var totalTransactionsCount = filtered.length;
    var totalProductsCount = products.length;
    var avgTransaction = completedTrx.length > 0 ? Math.round(totalRevenue / completedTrx.length) : 0;

    var elRev = document.getElementById('totalRevenue');
    var elTrx = document.getElementById('totalTransactions');
    var elProd = document.getElementById('totalProducts');
    var elAvg = document.getElementById('averageTransaction');

    if (elRev) elRev.textContent = formatRp(totalRevenue);
    if (elTrx) elTrx.textContent = totalTransactionsCount;
    if (elProd) elProd.textContent = totalProductsCount;
    if (elAvg) elAvg.textContent = formatRp(avgTransaction);
}

// Chart Pendapatan Bulanan
var salesChartInstance = null;

function renderSalesChart() {
    var ctx = document.getElementById('salesChart');
    if (!ctx) return;

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    var monthlyData = {};

    months.forEach(function (m, i) {
        var key = '2026-' + String(i + 1).padStart(2, '0');
        monthlyData[key] = 0;
    });

    transactions.forEach(function (t) {
        if (t.status === 'Selesai' && t.date) {
            var key = t.date.substring(0, 7);
            if (monthlyData[key] !== undefined) {
                monthlyData[key] += Number(t.total || 0);
            }
        }
    });

    var labels = months;
    var data = Object.values(monthlyData);

    var periodFilter = document.getElementById('periodFilter');
    var filterVal = periodFilter ? periodFilter.value : 'all';

    var bgColors = Object.keys(monthlyData).map(function (key) {
        if (filterVal === 'all' || key === filterVal) {
            return '#2563EB';
        }
        return '#CBD5E1';
    });

    if (salesChartInstance) {
        salesChartInstance.data.labels = labels;
        salesChartInstance.data.datasets[0].data = data;
        salesChartInstance.data.datasets[0].backgroundColor = bgColors;
        salesChartInstance.update();
    } else {
        salesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pendapatan (Rp)',
                    data: data,
                    backgroundColor: bgColors,
                    borderRadius: 8,
                    maxBarThickness: 38
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        titleFont: { family: 'Inter', size: 12 },
                        bodyFont: { family: 'Inter', size: 13, weight: '600' },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (item) { return formatRp(item.raw); }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#F1F5F9' },
                        ticks: {
                            color: '#94A3B8',
                            font: { size: 11 },
                            callback: function (v) { return 'Rp ' + (v / 1000).toFixed(0) + 'rb'; }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748B', font: { size: 11, weight: '500' } }
                    }
                }
            }
        });
    }
}

// Chart Kategori Produk
var categoryChartInstance = null;

function renderCategoryChart() {
    var ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    var catCounts = {};
    products.forEach(function (p) {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    var labels = Object.keys(catCounts);
    var data = Object.values(catCounts);
    var catColors = ['#2563EB', '#7C3AED', '#EA580C', '#16A34A', '#06B6D4', '#EC4899'];

    if (categoryChartInstance) {
        categoryChartInstance.data.labels = labels;
        categoryChartInstance.data.datasets[0].data = data;
        categoryChartInstance.update();
    } else {
        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: catColors.slice(0, data.length),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        padding: 10,
                        cornerRadius: 8,
                        bodyFont: { family: 'Inter', size: 13 },
                        callbacks: {
                            label: function (item) { return item.label + ': ' + item.raw + ' produk'; }
                        }
                    }
                }
            }
        });
    }

    var legendEl = document.getElementById('categoryLegend');
    if (legendEl) {
        legendEl.innerHTML = labels.map(function (cat, i) {
            return '<div class="legend-item">' +
                '<span class="legend-dot" style="background:' + catColors[i % catColors.length] + '"></span>' +
                cat + ' (' + catCounts[cat] + ')' +
                '</div>';
        }).join('');
    }
}

// Tabel Produk Terlaris di Overview
function renderBestSelling() {
    var tbody = document.getElementById('bestSellingTable');
    if (!tbody) return;

    var productMap = {};
    transactions.forEach(function (t) {
        if (t.status === 'Selesai') {
            if (t.itemsDetail && t.itemsDetail.length > 0) {
                t.itemsDetail.forEach(function (it) {
                    if (!productMap[it.name]) {
                        productMap[it.name] = { name: it.name, sold: 0, revenue: 0 };
                    }
                    productMap[it.name].sold += it.qty;
                    productMap[it.name].revenue += (it.price * it.qty);
                });
            } else {
                var cleanName = t.product.replace(/\s*\(x\d+\)/g, '').trim();
                if (!productMap[cleanName]) {
                    productMap[cleanName] = { name: cleanName, sold: 0, revenue: 0 };
                }
                productMap[cleanName].sold += (t.quantity || 1);
                productMap[cleanName].revenue += (t.total || 0);
            }
        }
    });

    var sorted = Object.values(productMap).sort(function (a, b) {
        return b.sold - a.sold || b.revenue - a.revenue;
    }).slice(0, 5);

    tbody.innerHTML = sorted.map(function (p, i) {
        var isTop = i === 0;
        return '<tr>' +
            '<td>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="width:26px;height:26px;border-radius:6px;background:' + (isTop ? 'var(--primary-light)' : 'var(--surface)') + ';color:' + (isTop ? 'var(--primary)' : 'var(--text-secondary)') + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">' + (i + 1) + '</span>' +
            '<strong style="font-size:13px;font-weight:600;">' + p.name + '</strong>' +
            '</div>' +
            '</td>' +
            '<td style="font-variant-numeric:tabular-nums;font-weight:600;">' + p.sold + ' unit</td>' +
            '<td style="font-variant-numeric:tabular-nums;font-weight:600;color:var(--primary);">' + formatRp(p.revenue) + '</td>' +
            '</tr>';
    }).join('');
}

// Status Stok di Overview
function renderStockList() {
    var container = document.getElementById('stockList');
    if (!container) return;

    var sorted = products.slice().sort(function (a, b) { return a.stock - b.stock; });

    container.innerHTML = sorted.map(function (p) {
        var badgeClass = 'safe';
        var badgeText = p.stock + ' unit';

        if (p.stock === 0) {
            badgeClass = 'empty';
            badgeText = 'Habis';
        } else if (p.stock <= 10) {
            badgeClass = 'low';
            badgeText = p.stock + ' unit (Menipis)';
        }

        return '<div class="stock-item">' +
            '<div class="stock-info">' +
            '<strong>' + p.name + '</strong>' +
            '<span>' + p.category + ' · ' + formatRp(p.price) + '</span>' +
            '</div>' +
            '<span class="stock-badge ' + badgeClass + '">' +
            '<span class="dot"></span>' +
            badgeText +
            '</span>' +
            '</div>';
    }).join('');
}

// ==========================================
// 2. MANAJEMEN PRODUK (KATALOG TOKO)
// ==========================================

function renderProducts() {
    var searchInput = document.getElementById('prodSearch');
    var catSelect = document.getElementById('prodCatFilter');

    var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var cat = catSelect ? catSelect.value : 'Semua';

    var filtered = products.filter(function (p) {
        var matchCat = (cat === 'Semua' || p.category === cat);
        var matchSearch = (!q || p.name.toLowerCase().indexOf(q) !== -1 || (p.sku && p.sku.toLowerCase().indexOf(q) !== -1));
        return matchCat && matchSearch;
    });

    var countBadge = document.getElementById('prodCountBadge');
    if (countBadge) countBadge.textContent = filtered.length + ' Produk';

    var tbody = document.getElementById('prodBody');
    var emptyEl = document.getElementById('emptyProd');

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    tbody.innerHTML = filtered.map(function (p) {
        var statusBadge = (p.status === 'Aktif') ?
            '<span class="status-badge selesai">Aktif</span>' :
            '<span class="status-badge batal">Nonaktif</span>';

        return '<tr>' +
            '<td>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div style="width:36px;height:36px;border-radius:8px;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">' +
            '<i class="fa-solid fa-box"></i>' +
            '</div>' +
            '<div>' +
            '<strong style="font-size:13px;color:var(--text-primary);display:block;">' + p.name + '</strong>' +
            '<span style="font-size:11px;color:var(--text-secondary);">' + p.category + '</span>' +
            '</div>' +
            '</div>' +
            '</td>' +
            '<td style="font-family:\'Source Code Pro\',monospace;font-size:12px;color:var(--text-secondary);">' + (p.sku || '-') + '</td>' +
            '<td><span class="badge-subtle">' + p.category + '</span></td>' +
            '<td style="font-variant-numeric:tabular-nums;color:var(--text-secondary);">' + formatRp(p.buy || Math.round(p.price * 0.8)) + '</td>' +
            '<td style="font-variant-numeric:tabular-nums;font-weight:700;color:var(--primary);">' + formatRp(p.price) + '</td>' +
            '<td style="font-variant-numeric:tabular-nums;font-weight:700;">' + p.stock + '</td>' +
            '<td>' + statusBadge + '</td>' +
            '<td class="text-right">' +
            '<div style="display:inline-flex;gap:6px;">' +
            '<button type="button" class="btn-edit-prod" onclick="openProductModal(' + p.id + ')" title="Edit Produk">' +
            '<i class="fa-solid fa-pen-to-square"></i>' +
            '</button>' +
            '<button type="button" class="btn-delete-prod" onclick="openDeleteModal(' + p.id + ')" title="Hapus Produk">' +
            '<i class="fa-solid fa-trash-can"></i>' +
            '</button>' +
            '</div>' +
            '</td>' +
            '</tr>';
    }).join('');
}

function openProductModal(id) {
    var editIdInput = document.getElementById('editProductId');
    var modalTitle = document.getElementById('modalProductTitle');
    var form = document.getElementById('productForm');

    if (id) {
        var p = products.find(function (x) { return x.id === id; });
        if (!p) return;
        if (editIdInput) editIdInput.value = p.id;
        if (modalTitle) modalTitle.textContent = 'Edit Produk';

        document.getElementById('fName').value = p.name;
        document.getElementById('fSku').value = p.sku || '';
        document.getElementById('fCat').value = p.category;
        document.getElementById('fBuy').value = p.buy || Math.round(p.price * 0.8);
        document.getElementById('fSell').value = p.price;
        document.getElementById('fStock').value = p.stock;
        document.getElementById('fStatus').value = p.status || 'Aktif';
    } else {
        if (editIdInput) editIdInput.value = '';
        if (modalTitle) modalTitle.textContent = 'Tambah Produk Baru';
        if (form) form.reset();
        var fStatus = document.getElementById('fStatus');
        if (fStatus) fStatus.value = 'Aktif';
    }

    var modal = document.getElementById('productModal');
    if (modal) modal.classList.add('active');
}

function closeProductModal() {
    var modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
}

function saveProduct(e) {
    e.preventDefault();

    var editId = document.getElementById('editProductId').value;
    var name = document.getElementById('fName').value.trim();
    var sku = document.getElementById('fSku').value.trim();
    var category = document.getElementById('fCat').value;
    var buy = Number(document.getElementById('fBuy').value) || 0;
    var sell = Number(document.getElementById('fSell').value) || 0;
    var stock = Number(document.getElementById('fStock').value) || 0;
    var status = document.getElementById('fStatus').value || 'Aktif';

    if (editId) {
        var p = products.find(function (x) { return x.id === Number(editId); });
        if (p) {
            p.name = name;
            p.sku = sku;
            p.category = category;
            p.buy = buy;
            p.price = sell;
            p.stock = stock;
            p.status = status;
            p.lastUpdated = '22 Nov 2026';
        }
        showToast('Produk "' + name + '" berhasil diperbarui!');
    } else {
        var newProduct = {
            id: Date.now(),
            sku: sku,
            name: name,
            category: category,
            buy: buy,
            price: sell,
            stock: stock,
            status: status,
            lastUpdated: '22 Nov 2026'
        };
        products.unshift(newProduct);
        showToast('Produk baru "' + name + '" berhasil ditambahkan ke katalog!');
    }

    closeProductModal();
    renderAll();
}

function openDeleteModal(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;
    pendingDeleteProductId = id;

    var nameEl = document.getElementById('deleteProductName');
    if (nameEl) nameEl.textContent = 'Yakin ingin menghapus "' + p.name + '"? Produk akan dihapus dari katalog dan persediaan stok.';

    var modal = document.getElementById('deleteModal');
    if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
    var modal = document.getElementById('deleteModal');
    if (modal) modal.classList.remove('active');
    pendingDeleteProductId = null;
}

function confirmDeleteProduct() {
    if (!pendingDeleteProductId) return;
    products = products.filter(function (x) { return x.id !== pendingDeleteProductId; });
    closeDeleteModal();
    renderAll();
    showToast('Produk berhasil dihapus.', 'info');
}

function resetProdFilter() {
    var searchInput = document.getElementById('prodSearch');
    var catSelect = document.getElementById('prodCatFilter');
    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = 'Semua';
    renderProducts();
}

// ==========================================
// 3. MANAJEMEN STOK (MUTASI MASUK & KELUAR)
// ==========================================

function updateStockSummary() {
    var safeCount = products.filter(function (p) { return p.stock > 10; }).length;
    var lowCount = products.filter(function (p) { return p.stock > 0 && p.stock <= 10; }).length;
    var emptyCount = products.filter(function (p) { return p.stock === 0; }).length;

    var elSafe = document.getElementById('stockSafeCount');
    var elLow = document.getElementById('stockLowCount');
    var elEmpty = document.getElementById('stockEmptyCount');

    if (elSafe) elSafe.textContent = safeCount + ' Produk';
    if (elLow) elLow.textContent = lowCount + ' Produk';
    if (elEmpty) elEmpty.textContent = emptyCount + ' Produk';
}

function renderStockTable() {
    var searchInput = document.getElementById('stockSearch');
    var statusSelect = document.getElementById('stockStatusFilter');

    var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var st = statusSelect ? statusSelect.value : 'Semua';

    var filtered = products.filter(function (p) {
        var matchSearch = (!q || p.name.toLowerCase().indexOf(q) !== -1 || (p.sku && p.sku.toLowerCase().indexOf(q) !== -1));
        var matchStatus = true;
        if (st === 'Aman') matchStatus = (p.stock > 10);
        else if (st === 'Menipis') matchStatus = (p.stock > 0 && p.stock <= 10);
        else if (st === 'Habis') matchStatus = (p.stock === 0);

        return matchSearch && matchStatus;
    });

    var tbody = document.getElementById('stockTableBody');
    var emptyEl = document.getElementById('emptyStockTable');

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    tbody.innerHTML = filtered.map(function (p) {
        var badgeHtml = '<span class="stock-badge safe"><span class="dot"></span>Aman</span>';
        if (p.stock === 0) {
            badgeHtml = '<span class="stock-badge empty"><span class="dot"></span>Habis</span>';
        } else if (p.stock <= 10) {
            badgeHtml = '<span class="stock-badge low"><span class="dot"></span>Menipis</span>';
        }

        return '<tr>' +
            '<td>' +
            '<strong style="font-size:13px;color:var(--text-primary);display:block;">' + p.name + '</strong>' +
            '<span style="font-size:11px;color:var(--text-secondary);">' + formatRp(p.price) + '</span>' +
            '</td>' +
            '<td style="font-family:\'Source Code Pro\',monospace;font-size:12px;color:var(--text-secondary);">' + (p.sku || '-') + '</td>' +
            '<td><span class="badge-subtle">' + p.category + '</span></td>' +
            '<td style="font-variant-numeric:tabular-nums;font-weight:700;font-size:14px;">' + p.stock + ' unit</td>' +
            '<td>' + badgeHtml + '</td>' +
            '<td style="font-size:12px;color:var(--text-secondary);">' + (p.lastUpdated || '22 Nov 2026') + '</td>' +
            '<td class="text-right">' +
            '<div style="display:inline-flex;gap:6px;">' +
            '<button type="button" class="btn-quick-stock in" onclick="quickStockModal(' + p.id + ', \'in\')" title="Catat Stok Masuk">' +
            '<i class="fa-solid fa-plus"></i> Masuk' +
            '</button>' +
            '<button type="button" class="btn-quick-stock out" onclick="quickStockModal(' + p.id + ', \'out\')" title="Catat Stok Keluar">' +
            '<i class="fa-solid fa-minus"></i> Keluar' +
            '</button>' +
            '</div>' +
            '</td>' +
            '</tr>';
    }).join('');
}

function openStockModal(type, preselectedId) {
    type = type || 'in';
    var modalTitle = document.getElementById('stockModalTitle');
    var badgeIcon = document.getElementById('stockModalBadgeIcon');
    var typeInput = document.getElementById('stockMutationType');
    var qtyLabel = document.getElementById('stockQtyLabel');
    var submitBtn = document.getElementById('btnSubmitStockMutation');
    var select = document.getElementById('stockProdSelect');
    var form = document.getElementById('stockMutationForm');

    if (typeInput) typeInput.value = type;

    if (type === 'in') {
        if (modalTitle) modalTitle.textContent = 'Catat Stok Masuk (Penambahan)';
        if (badgeIcon) badgeIcon.innerHTML = '<i class="fa-solid fa-arrow-down-to-line text-success"></i>';
        if (qtyLabel) qtyLabel.textContent = 'Jumlah Masuk (Unit) *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Simpan Stok Masuk';
    } else {
        if (modalTitle) modalTitle.textContent = 'Catat Stok Keluar (Pengurangan)';
        if (badgeIcon) badgeIcon.innerHTML = '<i class="fa-solid fa-arrow-up-from-line text-warning"></i>';
        if (qtyLabel) qtyLabel.textContent = 'Jumlah Keluar (Unit) *';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-minus"></i> Simpan Stok Keluar';
    }

    if (select) {
        select.innerHTML = products.map(function (p) {
            return '<option value="' + p.id + '">' + p.name + ' (Stok: ' + p.stock + ' unit)</option>';
        }).join('');

        if (preselectedId) {
            select.value = preselectedId;
        }
    }

    var qtyInput = document.getElementById('stockQty');
    var notesInput = document.getElementById('stockNotes');
    if (qtyInput) qtyInput.value = 10;
    if (notesInput) notesInput.value = '';

    onStockProductSelectChange();

    var modal = document.getElementById('stockMutationModal');
    if (modal) modal.classList.add('active');
}

function quickStockModal(id, type) {
    openStockModal(type, id);
}

function closeStockModal() {
    var modal = document.getElementById('stockMutationModal');
    if (modal) modal.classList.remove('active');
}

function onStockProductSelectChange() {
    var select = document.getElementById('stockProdSelect');
    var display = document.getElementById('stockCurrentDisplay');
    if (!select || !display) return;

    var selectedId = Number(select.value);
    var p = products.find(function (x) { return x.id === selectedId; });

    if (p) {
        var statusBadge = (p.stock === 0) ? '<span class="stock-badge empty"><span class="dot"></span>Habis</span>' :
            (p.stock <= 10 ? '<span class="stock-badge low"><span class="dot"></span>Menipis</span>' :
                '<span class="stock-badge safe"><span class="dot"></span>Aman</span>');

        display.innerHTML = '<i class="fa-solid fa-boxes-stacked text-primary"></i>' +
            '<span>Stok saat ini: <strong>' + p.stock + ' unit</strong> ' + statusBadge + ' (Kategori: ' + p.category + ')</span>';
    }
}

function saveStockMutation(e) {
    e.preventDefault();

    var select = document.getElementById('stockProdSelect');
    var typeInput = document.getElementById('stockMutationType');
    var qtyInput = document.getElementById('stockQty');

    if (!select || !typeInput || !qtyInput) return;

    var selectedId = Number(select.value);
    var type = typeInput.value;
    var qty = Number(qtyInput.value) || 0;

    if (qty <= 0) {
        showToast('Jumlah mutasi stok harus lebih dari 0 unit!', 'info');
        return;
    }

    var p = products.find(function (x) { return x.id === selectedId; });
    if (!p) return;

    if (type === 'in') {
        p.stock += qty;
        p.lastUpdated = '22 Nov 2026';
        showToast('Stok masuk +' + qty + ' unit berhasil ditambahkan untuk "' + p.name + '". (Total: ' + p.stock + ' unit)');
    } else {
        if (qty > p.stock) {
            showToast('Jumlah stok keluar (' + qty + ') melebihi stok yang ada (' + p.stock + ')!', 'info');
            return;
        }
        p.stock = Math.max(0, p.stock - qty);
        p.lastUpdated = '22 Nov 2026';
        showToast('Stok keluar -' + qty + ' unit berhasil dicatat untuk "' + p.name + '". (Sisa: ' + p.stock + ' unit)');
    }

    closeStockModal();
    renderAll();
}

function resetStockFilter() {
    var searchInput = document.getElementById('stockSearch');
    var statusSelect = document.getElementById('stockStatusFilter');
    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = 'Semua';
    renderStockTable();
}

// ==========================================
// 4. POS PENJUALAN (KASIR REAL-TIME)
// ==========================================

function posFilterProducts() {
    var searchInput = document.getElementById('posSearch');
    var q = searchInput ? searchInput.value.toLowerCase().trim() : '';

    var filtered = products.filter(function (p) {
        var matchCat = posActiveCategory === 'Semua' || p.category === posActiveCategory;
        var matchSearch = p.name.toLowerCase().indexOf(q) !== -1 || (p.sku && p.sku.toLowerCase().indexOf(q) !== -1);
        return matchCat && matchSearch;
    });

    var grid = document.getElementById('posProductGrid');
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 30px; color: var(--text-muted);">' +
            '<i class="fa-solid fa-box-open" style="font-size:32px;margin-bottom:8px;opacity:0.5;"></i>' +
            '<p style="font-size:13px;">Tidak ada produk yang cocok.</p>' +
            '</div>';
        return;
    }

    grid.innerHTML = filtered.map(function (p) {
        var isOut = p.stock <= 0;
        var stockTagClass = isOut ? 'empty' : (p.stock <= 10 ? 'low' : '');
        var stockText = isOut ? 'Habis (0)' : 'Stok: ' + p.stock;

        return '<div class="pos-product-card ' + (isOut ? 'out-of-stock' : '') + '" onclick="posAddToCart(' + p.id + ')">' +
            '<div class="pos-product-top">' +
            '<span class="pos-product-category">' + p.category + '</span>' +
            '<span class="pos-product-stock-tag ' + stockTagClass + '">' + stockText + '</span>' +
            '</div>' +
            '<div>' +
            '<h5 class="pos-product-name">' + p.name + '</h5>' +
            '<p class="pos-product-sku">' + (p.sku || 'SKU-00' + p.id) + '</p>' +
            '</div>' +
            '<div class="pos-product-bottom">' +
            '<span class="pos-product-price">' + formatRp(p.price) + '</span>' +
            '<button type="button" class="pos-add-btn" title="Tambah ke keranjang" ' + (isOut ? 'disabled' : '') + '>' +
            '<i class="fa-solid fa-plus"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

function posSelectCategory(cat, btn) {
    posActiveCategory = cat;
    document.querySelectorAll('.pos-cat-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    posFilterProducts();
}

function posAddToCart(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;

    if (p.stock <= 0) {
        showToast('Stok produk "' + p.name + '" sudah habis!', 'info');
        return;
    }

    var inCart = posCart.find(function (x) { return x.id === id; });
    if (inCart) {
        if (inCart.qty >= p.stock) {
            showToast('Jumlah pesanan sudah mencapai batas stok tersedia (' + p.stock + ')!', 'info');
            return;
        }
        inCart.qty += 1;
    } else {
        posCart.push({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            qty: 1
        });
    }

    posRenderCart();
}

function posUpdateQty(id, delta) {
    var idx = posCart.findIndex(function (x) { return x.id === id; });
    if (idx === -1) return;

    var p = products.find(function (x) { return x.id === id; });

    if (delta > 0 && p && posCart[idx].qty >= p.stock) {
        showToast('Stok tidak mencukupi untuk menambah item lagi!', 'info');
        return;
    }

    posCart[idx].qty += delta;
    if (posCart[idx].qty <= 0) {
        posCart.splice(idx, 1);
    }

    posRenderCart();
}

function posClearCart() {
    posCart = [];
    var disc = document.getElementById('posDiscount');
    if (disc) disc.value = 0;
    posRenderCart();
}

function posSelectPayment(method, btn) {
    posSelectedPayment = method;
    document.querySelectorAll('.pay-method-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
}

function posRenderCart() {
    var container = document.getElementById('posCartItems');
    var emptyEl = document.getElementById('posCartEmpty');
    var btnCheckout = document.getElementById('posCheckoutBtn');

    if (!container || !emptyEl) return;

    if (posCart.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'block';
        if (btnCheckout) btnCheckout.disabled = true;
    } else {
        emptyEl.style.display = 'none';
        if (btnCheckout) btnCheckout.disabled = false;

        container.innerHTML = posCart.map(function (item) {
            return '<div class="cart-item">' +
                '<div class="cart-item-info">' +
                '<div class="cart-item-name">' + item.name + '</div>' +
                '<div class="cart-item-price">' + formatRp(item.price) + ' × ' + item.qty + '</div>' +
                '</div>' +
                '<div class="cart-item-qty-controls">' +
                '<button type="button" class="qty-btn" onclick="posUpdateQty(' + item.id + ', -1)" title="Kurangi">' +
                '<i class="fa-solid fa-minus"></i>' +
                '</button>' +
                '<span class="cart-item-qty">' + item.qty + '</span>' +
                '<button type="button" class="qty-btn" onclick="posUpdateQty(' + item.id + ', 1)" title="Tambah">' +
                '<i class="fa-solid fa-plus"></i>' +
                '</button>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    var subtotal = posCart.reduce(function (sum, item) {
        return sum + (item.price * item.qty);
    }, 0);

    var discEl = document.getElementById('posDiscount');
    var discount = Math.max(0, Number(discEl ? discEl.value : 0) || 0);
    var finalTotal = Math.max(0, subtotal - discount);

    var elSub = document.getElementById('posSubtotal');
    var elTot = document.getElementById('posTotal');

    if (elSub) elSub.textContent = formatRp(subtotal);
    if (elTot) elTot.textContent = formatRp(finalTotal);
}

function posProcessCheckout() {
    if (posCart.length === 0) {
        showToast('Keranjang masih kosong! Silakan pilih produk terlebih dahulu.', 'info');
        return;
    }

    for (var i = 0; i < posCart.length; i++) {
        var cartItem = posCart[i];
        var p = products.find(function (x) { return x.id === cartItem.id; });
        if (!p || p.stock < cartItem.qty) {
            showToast('Stok produk "' + cartItem.name + '" tidak mencukupi untuk checkout!', 'info');
            return;
        }
    }

    var subtotal = posCart.reduce(function (sum, item) {
        return sum + (item.price * item.qty);
    }, 0);
    var discEl = document.getElementById('posDiscount');
    var discount = Math.max(0, Number(discEl ? discEl.value : 0) || 0);
    var finalTotal = Math.max(0, subtotal - discount);

    var now = new Date();
    var yyyy = now.getFullYear();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    var hh = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');

    var dateStr = yyyy + '-' + mm + '-' + dd;
    var displayDateStr = dd + ' Nov ' + yyyy + ', ' + hh + ':' + min;

    var newSeq = String(transactions.length + 1).padStart(3, '0');
    var newId = 'TRX-' + newSeq;

    var custInput = document.getElementById('posCustomerName');
    var custName = (custInput && custInput.value.trim()) ? custInput.value.trim() : 'Pelanggan Umum';

    var itemSummaries = posCart.map(function (item) {
        return item.name + ' (x' + item.qty + ')';
    }).join(', ');

    var totalQty = posCart.reduce(function (sum, it) { return sum + it.qty; }, 0);
    var mainCat = posCart[0] ? posCart[0].category : 'Sembako';

    // Kurangi stok produk
    posCart.forEach(function (cartItem) {
        var p = products.find(function (x) { return x.id === cartItem.id; });
        if (p) {
            p.stock = Math.max(0, p.stock - cartItem.qty);
            p.lastUpdated = dd + ' Nov ' + yyyy;
        }
    });

    var newTrx = {
        id: newId,
        date: dateStr,
        displayDate: displayDateStr,
        product: itemSummaries,
        customer: custName,
        quantity: totalQty,
        total: finalTotal,
        status: 'Selesai',
        category: mainCat,
        method: posSelectedPayment,
        itemsDetail: posCart.map(function (it) {
            return { name: it.name, price: it.price, qty: it.qty, category: it.category };
        })
    };

    transactions.unshift(newTrx);

    renderAll();

    var modalMeta = document.getElementById('posReceiptMeta');
    var modalTot = document.getElementById('posReceiptTotal');
    if (modalMeta) modalMeta.textContent = newId + ' • ' + posSelectedPayment + ' • ' + custName;
    if (modalTot) modalTot.textContent = formatRp(finalTotal);

    var successModal = document.getElementById('posSuccessModal');
    if (successModal) successModal.classList.add('active');

    posCart = [];
    if (discEl) discEl.value = 0;
    if (custInput) custInput.value = '';
    posRenderCart();

    showToast('Transaksi ' + newId + ' berhasil diproses & data otomatis tersinkronisasi!', 'success');
}

function posCloseModal() {
    var successModal = document.getElementById('posSuccessModal');
    if (successModal) successModal.classList.remove('active');
}

// ==========================================
// 5. RIWAYAT TRANSAKSI (PUSAT AUDIT)
// ==========================================

function renderTransactions() {
    var searchInput = document.getElementById('trxSearch');
    var dateInput = document.getElementById('trxDate');
    var statusSelect = document.getElementById('trxStatus');

    var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var d = dateInput ? dateInput.value : '';
    var s = statusSelect ? statusSelect.value : 'Semua';

    var filtered = transactions.filter(function (t) {
        var matchQ = !q || (t.id && t.id.toLowerCase().indexOf(q) !== -1) ||
            (t.product && t.product.toLowerCase().indexOf(q) !== -1) ||
            (t.customer && t.customer.toLowerCase().indexOf(q) !== -1);
        var matchD = !d || t.date === d;
        var matchS = s === 'Semua' || t.status === s;
        return matchQ && matchD && matchS;
    });

    var countBadge = document.getElementById('trxCountBadge');
    if (countBadge) countBadge.textContent = filtered.length + ' Transaksi';

    var paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) paginationInfo.textContent = 'Menampilkan ' + filtered.length + ' dari ' + transactions.length + ' transaksi';

    var tbody = document.getElementById('trxBody');
    var emptyEl = document.getElementById('emptyTrx');

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    tbody.innerHTML = filtered.map(function (t) {
        var statusClass = 'selesai';
        if (t.status === 'Menunggu') statusClass = 'menunggu';
        if (t.status === 'Dibatalkan' || t.status === 'Batal') statusClass = 'batal';

        var displayTime = t.displayDate || (formatDate(t.date));

        return '<tr>' +
            '<td><span style="font-family:\'Source Code Pro\',monospace;color:var(--primary);font-size:12px;font-weight:700;">' + t.id + '</span></td>' +
            '<td style="font-size:12px;color:var(--text-secondary);">' + displayTime + '</td>' +
            '<td><strong>' + (t.customer || 'Umum') + '</strong></td>' +
            '<td style="max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + t.product + '">' + t.product + '</td>' +
            '<td style="font-variant-numeric:tabular-nums;font-weight:700;">' + formatRp(t.total) + '</td>' +
            '<td><span class="badge-subtle">' + (t.method || 'Tunai') + '</span></td>' +
            '<td><span class="status-badge ' + statusClass + '">' + t.status + '</span></td>' +
            '<td class="text-right">' +
            '<button type="button" class="btn-action-detail" onclick="openDetailModal(\'' + t.id + '\')">' +
            '<i class="fa-solid fa-receipt"></i> Detail' +
            '</button>' +
            '</td>' +
            '</tr>';
    }).join('');
}

function resetTrxFilters() {
    var searchInput = document.getElementById('trxSearch');
    var dateInput = document.getElementById('trxDate');
    var statusSelect = document.getElementById('trxStatus');

    if (searchInput) searchInput.value = '';
    if (dateInput) dateInput.value = '';
    if (statusSelect) statusSelect.value = 'Semua';

    renderTransactions();
    showToast('Filter riwayat transaksi direset.', 'info');
}

function openDetailModal(id) {
    var t = transactions.find(function (x) { return x.id === id; });
    if (!t) return;
    currentSelectedTrx = t;

    var elId = document.getElementById('modalTrxId');
    var elDate = document.getElementById('modalTrxDate');
    var elCust = document.getElementById('modalCustomer');
    var elPay = document.getElementById('modalPayment');
    var elBadge = document.getElementById('modalStatusBadge');
    var elItems = document.getElementById('modalItems');
    var elTot = document.getElementById('modalTotal');

    if (elId) elId.textContent = t.id;
    if (elDate) elDate.textContent = (t.displayDate || t.date) + ' WIB';
    if (elCust) elCust.textContent = t.customer || 'Pelanggan Umum';
    if (elPay) elPay.textContent = t.method || 'Tunai';

    if (elBadge) {
        var statusClass = 'selesai';
        if (t.status === 'Menunggu') statusClass = 'menunggu';
        if (t.status === 'Dibatalkan' || t.status === 'Batal') statusClass = 'batal';
        elBadge.className = 'status-badge ' + statusClass;
        elBadge.textContent = t.status;
    }

    if (elTot) elTot.textContent = formatRp(t.total);

    if (elItems) {
        if (t.itemsDetail && t.itemsDetail.length > 0) {
            elItems.innerHTML = t.itemsDetail.map(function (it) {
                return '<div class="receipt-item-line">' +
                    '<span>' + it.name + ' (x' + it.qty + ')</span>' +
                    '<strong style="font-variant-numeric:tabular-nums;">' + formatRp(it.price * it.qty) + '</strong>' +
                    '</div>';
            }).join('');
        } else {
            var itemsList = t.product.split(',');
            elItems.innerHTML = itemsList.map(function (it) {
                return '<div class="receipt-item-line">' +
                    '<span>' + it.trim() + '</span>' +
                    '<i class="fa-solid fa-check text-primary" style="font-size:11px;"></i>' +
                    '</div>';
            }).join('');
        }
    }

    var modal = document.getElementById('detailModal');
    if (modal) modal.classList.add('active');
}

function closeDetailModal() {
    var modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
}

function printSingleReceipt() {
    if (!currentSelectedTrx) return;
    document.body.classList.add('printing-receipt');
    window.print();
    setTimeout(function () {
        document.body.classList.remove('printing-receipt');
    }, 1000);
}

// ==========================================
// 6. LAPORAN KEUANGAN & EKSPOR DATA
// ==========================================

var currentReportPeriod = '30d';

function updateReportPeriod(val) {
    currentReportPeriod = val;
    var badge = document.getElementById('reportPeriodBadge');
    var labelMap = {
        today: 'Hari Ini (20 Nov 2026)',
        '7d': '7 Hari Terakhir',
        '30d': 'Bulan Ini (Nov 2026)',
        all: 'Semua Periode'
    };
    if (badge) {
        badge.textContent = 'Periode Aktif: ' + (labelMap[val] || val);
    }
    renderReports();
    showToast('Periode laporan diperbarui: ' + (labelMap[val] || val), 'info');
}

function renderReports() {
    // Tentukan filter tanggal berdasarkan currentReportPeriod
    var periodFilteredTrx = transactions.filter(function (t) {
        if (currentReportPeriod === 'all') return true;
        if (currentReportPeriod === 'today') {
            return t.date === '2026-11-20' || t.date === new Date().toISOString().split('T')[0];
        }
        if (currentReportPeriod === '7d') {
            return t.date >= '2026-11-14';
        }
        if (currentReportPeriod === '30d') {
            return t.date >= '2026-11-01';
        }
        return true;
    });

    var completedTrx = periodFilteredTrx.filter(function (t) { return t.status === 'Selesai'; });
    var grossRevenue = completedTrx.reduce(function (sum, t) { return sum + Number(t.total || 0); }, 0);

    var cogs = Math.round(grossRevenue * 0.70);
    var netProfit = Math.round(grossRevenue * 0.30);
    var successCount = completedTrx.length;

    var elGross = document.getElementById('reportGrossRevenue');
    var elCogs = document.getElementById('reportCOGS');
    var elProfit = document.getElementById('reportNetProfit');
    var elSuccess = document.getElementById('reportSuccessCount');

    var elRepSales = document.getElementById('repSales');
    var elRepCost = document.getElementById('repCost');
    var elRepProfit = document.getElementById('repProfit');
    var elRepTrx = document.getElementById('repTrx');

    if (elGross) elGross.textContent = formatRp(grossRevenue);
    if (elCogs) elCogs.textContent = formatRp(cogs);
    if (elProfit) elProfit.textContent = formatRp(netProfit);
    if (elSuccess) elSuccess.textContent = successCount + ' Transaksi';

    if (elRepSales) elRepSales.textContent = formatRp(grossRevenue);
    if (elRepCost) elRepCost.textContent = formatRp(cogs);
    if (elRepProfit) elRepProfit.textContent = formatRp(netProfit);
    if (elRepTrx) elRepTrx.textContent = successCount + ' Struk';

    // 1. Rekapitulasi Produk Terlaris & Keuntungan
    var prodSummary = {};
    completedTrx.forEach(function (t) {
        if (t.itemsDetail && t.itemsDetail.length > 0) {
            t.itemsDetail.forEach(function (it) {
                var pName = it.name;
                if (!prodSummary[pName]) {
                    prodSummary[pName] = {
                        name: pName,
                        category: it.category || 'Sembako',
                        sold: 0,
                        revenue: 0
                    };
                }
                prodSummary[pName].sold += it.qty;
                prodSummary[pName].revenue += (it.price * it.qty);
            });
        } else if (t.product) {
            var itemsList = t.product.split(',');
            itemsList.forEach(function (str) {
                var cleanName = str.replace(/\(x\d+\)/g, '').trim();
                var qtyMatch = str.match(/\(x(\d+)\)/);
                var qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
                if (!prodSummary[cleanName]) {
                    prodSummary[cleanName] = {
                        name: cleanName,
                        category: t.category || 'Sembako',
                        sold: 0,
                        revenue: 0
                    };
                }
                prodSummary[cleanName].sold += qty;
                prodSummary[cleanName].revenue += Math.round(t.total / Math.max(1, itemsList.length));
            });
        }
    });

    var tbodyProd = document.getElementById('reportProductBody');
    if (tbodyProd) {
        var sortedProds = Object.values(prodSummary).sort(function (a, b) { return b.sold - a.sold; });
        if (sortedProds.length === 0) {
            tbodyProd.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">Belum ada data penjualan pada periode ini</td></tr>';
        } else {
            tbodyProd.innerHTML = sortedProds.map(function (p) {
                var prodProfit = Math.round(p.revenue * 0.30);
                return '<tr>' +
                    '<td style="font-weight:600;color:var(--text-primary);">' + p.name + '</td>' +
                    '<td><span class="badge-subtle">' + p.category + '</span></td>' +
                    '<td style="font-variant-numeric:tabular-nums;font-weight:600;">' + p.sold + ' unit</td>' +
                    '<td style="font-variant-numeric:tabular-nums;font-weight:700;">' + formatRp(p.revenue) + '</td>' +
                    '<td style="font-variant-numeric:tabular-nums;color:var(--success);font-weight:700;">' + formatRp(prodProfit) + '</td>' +
                    '</tr>';
            }).join('');
        }
    }

    // 2. Rekapitulasi per Kategori
    var catSummary = {};
    categories.forEach(function (c) {
        catSummary[c.name] = { name: c.name, sold: 0, revenue: 0 };
    });

    completedTrx.forEach(function (t) {
        if (t.itemsDetail && t.itemsDetail.length > 0) {
            t.itemsDetail.forEach(function (it) {
                var cat = it.category || 'Sembako';
                if (!catSummary[cat]) {
                    catSummary[cat] = { name: cat, sold: 0, revenue: 0 };
                }
                catSummary[cat].sold += it.qty;
                catSummary[cat].revenue += (it.price * it.qty);
            });
        } else {
            var cat = t.category || 'Sembako';
            if (!catSummary[cat]) {
                catSummary[cat] = { name: cat, sold: 0, revenue: 0 };
            }
            catSummary[cat].sold += (t.quantity || 1);
            catSummary[cat].revenue += (t.total || 0);
        }
    });

    var tbodyCat = document.getElementById('reportCategoryBody');
    if (tbodyCat) {
        var totalRevAll = grossRevenue > 0 ? grossRevenue : 1;
        tbodyCat.innerHTML = Object.values(catSummary).map(function (c) {
            var profit = Math.round(c.revenue * 0.30);
            var pct = ((c.revenue / totalRevAll) * 100).toFixed(1);

            return '<tr>' +
                '<td><strong>' + c.name + '</strong></td>' +
                '<td style="font-variant-numeric:tabular-nums;font-weight:600;">' + c.sold + ' unit</td>' +
                '<td style="font-variant-numeric:tabular-nums;font-weight:700;">' + formatRp(c.revenue) + '</td>' +
                '<td style="font-variant-numeric:tabular-nums;color:var(--success);font-weight:700;">' + formatRp(profit) + '</td>' +
                '<td>' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                '<div style="flex:1;height:6px;background:var(--border);border-radius:4px;overflow:hidden;">' +
                '<div style="width:' + pct + '%;height:100%;background:var(--primary);border-radius:4px;"></div>' +
                '</div>' +
                '<span style="font-size:12px;font-weight:600;min-width:38px;">' + pct + '%</span>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');
    }
}

function exportPrintPDF() {
    window.print();
}

function exportTransactionsCSV() {
    if (transactions.length === 0) {
        showToast('Tidak ada data transaksi untuk diekspor!', 'info');
        return;
    }

    var headers = ['No Transaksi', 'Tanggal', 'Waktu', 'Pelanggan', 'Rincian Produk', 'Jumlah Item', 'Metode Bayar', 'Total Pembayaran (Rp)', 'Status'];
    var rows = [];

    transactions.forEach(function (t) {
        var cleanProduct = '"' + (t.product || '').replace(/"/g, '""') + '"';
        var cleanCustomer = '"' + (t.customer || 'Pelanggan Umum').replace(/"/g, '""') + '"';

        rows.push([
            t.id,
            t.date,
            t.displayDate || '-',
            cleanCustomer,
            cleanProduct,
            t.quantity || 1,
            t.method || 'Tunai',
            t.total || 0,
            t.status || 'Selesai'
        ].join(','));
    });

    var csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Laporan_Penjualan_UMKM_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Laporan penjualan CSV / Excel berhasil diunduh!', 'success');
}

// ==========================================
// 7. MASTER RENDER & INIT
// ==========================================

function renderAll() {
    updateKPI();
    renderSalesChart();
    renderCategoryChart();
    renderBestSelling();
    renderStockList();
    posFilterProducts();
    renderTransactions();
    renderReports();
    renderProducts();
    renderStockTable();
    updateStockSummary();
}

document.addEventListener('DOMContentLoaded', function () {
    var dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Sidebar Mobile Toggle
    var sidebar = document.getElementById('sidebar');
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.querySelectorAll('.nav-link');

    var backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            backdrop.classList.toggle('active');
        });
    }

    backdrop.addEventListener('click', function () {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
    });

    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });
    });

    // Period Filter Listener
    var periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', function () {
            updateKPI();
            renderSalesChart();
            renderBestSelling();
        });
    }

    // Initial render
    renderAll();
    posRenderCart();
});
