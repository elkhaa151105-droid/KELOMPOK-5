<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner']);

$role = $_SESSION['role'] ?? '';
$nama = $_SESSION['nama'] ?? '';

// Format sapaan sesuai role & nama
$display_role = ($role === 'owner') ? 'Owner Kataji' : ($nama ?: 'Barber');
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="dashboard-page">

    <!-- HEADER DASHBOARD -->
    <div class="dashboard-heading">
        <h1>Dashboard</h1>
        <p>Selamat Datang, <?= htmlspecialchars($display_role) ?></p>
    </div>

    <!-- SUMMARY CARDS (4 KARTU) -->
    <div class="dashboard-summary">

        <!-- PELANGGAN HARI INI -->
        <div class="summary-card">
            <div class="summary-card-header">
                <span class="summary-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </span>
                <span class="summary-title">Pelanggan Hari Ini</span>
            </div>
            <strong class="summary-value" id="dashPelangganHariIni">0</strong>
        </div>

        <!-- TRANSAKSI HARI INI -->
        <div class="summary-card">
            <div class="summary-card-header">
                <span class="summary-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </span>
                <span class="summary-title">Transaksi Hari Ini</span>
            </div>
            <strong class="summary-value" id="dashTransaksiHariIni">0</strong>
        </div>

        <!-- PENDAPATAN HARI INI -->
        <div class="summary-card">
            <div class="summary-card-header">
                <span class="summary-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                </span>
                <span class="summary-title">Pemasukan Hari Ini</span>
            </div>
            <strong class="summary-value" id="dashPendapatanHariIni">Rp0</strong>
        </div>

        <!-- LABA KOTOR HARI INI -->
        <div class="summary-card">
            <div class="summary-card-header">
                <span class="summary-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                </span>
                <span class="summary-title">Laba Kotor Hari Ini</span>
            </div>
            <strong class="summary-value" id="dashLabaKotorHariIni">Rp0</strong>
        </div>

    </div>


    <!-- REKAP KEUANGAN -->
        <!-- REKAP PEMASUKAN HARIAN, MINGGUAN, DAN BULANAN (4.8.2) -->
    <section class="dashboard-section rekap-pemasukan rekap-card">
        <div class="rekap-header">
            <h2>Rekap Keuangan</h2>

            <div class="rekap-filter-area">
                <div class="periode-pemasukan" aria-label="Filter periode pemasukan">
                    <button type="button" class="periode-pemasukan-btn active" data-period="minggu" aria-pressed="true">Minggu Ini</button>
                    <button type="button" class="periode-pemasukan-btn" data-period="bulan" aria-pressed="false">Bulan Ini</button>
                    <button type="button" class="periode-pemasukan-btn" data-period="semua" aria-pressed="false">Semua</button>
                </div>
            </div>
        </div>

        <div class="financial-metrics rekap-metrics">
            <div class="metric-item metric-pemasukan">
                <span class="metric-label">Pemasukan</span>
                <strong class="metric-val" id="totalPemasukan">Rp0</strong>
            </div>
            <div class="metric-item">
                <span class="metric-label">HPP</span>
                <strong class="metric-val" id="totalHpp">Rp0</strong>
            </div>
            <div class="metric-item">
                <span class="metric-label">Laba Kotor</span>
                <strong class="metric-val" id="totalLabaKotor">Rp0</strong>
            </div>
            <div class="metric-item">
                <span class="metric-label">Biaya Operasional</span>
                <strong class="metric-val" id="totalBiayaOperasional">Rp0</strong>
            </div>
            <div class="metric-item">
                <span class="metric-label">Laba Bersih</span>
                <strong class="metric-val" id="totalLabaBersih">Rp0</strong>
            </div>
        </div>

        <div class="table-responsive" id="tabelPemasukanWrapper" hidden>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Barber</th>
                        <th>Total Pemasukan</th>
                    </tr>
                </thead>
                <tbody id="tabelPemasukanBody"></tbody>
            </table>
        </div>
    </section>

    <!-- PEMASUKAN PER BARBER -->
    <section class="dashboard-section rekap-barber-section">
        <h2 class="dashboard-card-title">Pemasukan per Barber</h2>

        <div id="statusPemasukan" class="rekap-status" role="status" aria-live="polite">
            Memuat data pemasukan...
        </div>

        <div class="table-responsive rekap-barber-table" id="tabelPemasukanWrapper" hidden>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Barber</th>
                        <th>Jumlah Transaksi</th>
                        <th>Total Pemasukan</th>
                    </tr>
                </thead>
                <tbody id="tabelPemasukanBody"></tbody>
            </table>
        </div>
    </section>


    <!-- GRAFIK DASHBOARD -->
    <div class="dashboard-chart-grid">
        <section class="dashboard-section dashboard-chart-card">
            <div class="trend-chart-header">
                <div>
                    <h2 class="dashboard-card-title" id="trenPemasukanJudul">Pemasukan 7 Hari Terakhir</h2>
                    <strong id="trenPemasukanIndicator" class="trend-indicator trend-stabil">Stabil 0%</strong>
                </div>
                <select id="trenPemasukanPeriode" class="form-select trend-period-select">
                    <option value="7_hari">7 Hari Terakhir</option>
                    <option value="minggu">Per Minggu</option>
                    <option value="bulan">Per Bulan</option>
                </select>
            </div>
            <div class="trend-summary-grid">
                <div class="trend-summary-card trend-summary-status"><span class="trend-summary-icon">↗</span><div><strong id="trenStatusRingkas">Stabil 0%</strong><small>dibanding periode sebelumnya</small></div></div>
                <div class="trend-summary-card"><span>Total periode</span><strong id="trenTotalAktif">Rp0</strong></div>
                <div class="trend-summary-card"><span>Hari tertinggi</span><strong id="trenHariTertinggi">Rp0</strong><small id="trenHariTertinggiTanggal">Belum ada data</small></div>
            </div>
            <div class="line-chart" id="dashboardLineChart" aria-label="Grafik pemasukan tujuh hari terakhir" aria-live="polite">
                <div class="chart-empty-state">Memuat grafik pemasukan...</div>
            </div>
        </section>

        <section class="dashboard-section payment-chart-card">
            <h2 class="dashboard-card-title">Distribusi Pembayaran</h2>
            <div class="payment-chart-content">
                <div class="payment-donut" role="img" aria-label="Distribusi pembayaran belum tersedia">
                    <div class="payment-donut-center"><strong id="dashboardJumlahTransaksi">0</strong><span>Transaksi</span></div>
                </div>
                <div class="payment-legend">
                    <div><span class="legend-dot legend-cash"></span><span>Tunai</span><strong id="legendCash">(0 trx) Rp0</strong></div>
                    <div><span class="legend-dot legend-transfer"></span><span>Transfer</span><strong id="legendTransfer">(0 trx) Rp0</strong></div>
                    <div><span class="legend-dot legend-qris"></span><span>QRIS</span><strong id="legendQris">(0 trx) Rp0</strong></div>
                </div>
            </div>
        </section>
    </div>

    <!-- AKSI DASHBOARD -->
    <div class="dashboard-bottom-grid">
        <section class="dashboard-section menu-terlaris-section">
            <div class="layanan-terlaris-header">
                <h2 class="dashboard-card-title">Layanan Terlaris</h2>
                <div class="layanan-terlaris-controls">
                    <button type="button" class="layanan-period-btn active" data-period="minggu">Minggu Ini</button>
                    <button type="button" class="layanan-period-btn" data-period="bulan">Bulan Ini</button>
                    <button type="button" class="layanan-period-btn" data-period="semua">Semua</button>
                    <button type="button" class="layanan-sort-btn" data-sort="terbanyak">Paling Sering</button>
                </div>
            </div>
            <div class="layanan-populer-empty">Memuat data layanan...</div>
        </section>

        <section class="dashboard-section reset-section">
            <h2 class="reset-card-title">Permintaan Reset Password</h2>

            <div class="reset-card-body">
                <span class="reset-api-status">Permintaan reset password belum memiliki API frontend.</span>
            </div>
        </section>
    </div>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
