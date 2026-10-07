<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_login();

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
            <strong class="summary-value">2</strong>
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
            <strong class="summary-value">2</strong>
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
                <span class="summary-title">Pendapatan Hari Ini</span>
            </div>
            <strong class="summary-value">Rp200.000</strong>
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
            <strong class="summary-value">Rp100.000</strong>
        </div>

    </div>


    <!-- REKAP KEUANGAN -->
    <section class="dashboard-section rekap-card">

        <div class="rekap-header">
            <h2>Rekap Keuangan</h2>

            <div class="period-filter">
                <button type="button" class="filter-btn active">Hari Ini</button>
                <button type="button" class="filter-btn">Minggu Ini</button>
                <button type="button" class="filter-btn">Bulan Ini</button>
            </div>
        </div>

        <div class="financial-metrics">

            <div class="metric-item">
                <span class="metric-label">Pendapatan</span>
                <strong class="metric-val">Rp450.000</strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">HPP</span>
                <strong class="metric-val">Rp450.000</strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">Laba Kotor</span>
                <strong class="metric-val">Rp450.000</strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">Biaya Operasional</span>
                <strong class="metric-val">Rp450.000</strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">Laba Bersih</span>
                <strong class="metric-val">Rp450.000</strong>
            </div>

        </div>

    </section>


    <!-- BARBER HARI INI -->
    <section class="barber-section">

        <h2 class="section-title">Barber Hari Ini</h2>

        <div class="barber-grid">

            <!-- BARBER 1: SANDI -->
            <div class="barber-card">
                <div class="barber-photo-box">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>

                <div class="barber-details">
                    <h3 class="barber-name">SANDI</h3>
                    <p class="barber-specialty">
                        Spesialis:<br>
                        Coloring, Perming
                    </p>
                    <span class="barber-badge badge-hadir">
                        <span class="badge-dot"></span> Hadir
                    </span>
                </div>
            </div>

            <!-- BARBER 2: ERIK -->
            <div class="barber-card">
                <div class="barber-photo-box">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>

                <div class="barber-details">
                    <h3 class="barber-name">ERIK</h3>
                    <p class="barber-specialty">
                        Spesialis:<br>
                        Coloring, Smoothing
                    </p>
                    <span class="barber-badge badge-izin">
                        <span class="badge-dot"></span> Izin
                    </span>
                </div>
            </div>

            <!-- BARBER 3: UJANG -->
            <div class="barber-card">
                <div class="barber-photo-box">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>

                <div class="barber-details">
                    <h3 class="barber-name">UJANG</h3>
                    <p class="barber-specialty">
                        Spesialis:<br>
                        Smoothing, Perming
                    </p>
                    <span class="barber-badge badge-tidak-hadir">
                        <span class="badge-dot"></span> Tidak Hadir
                    </span>
                </div>
            </div>

        </div>

    </section>


    <!-- PERMINTAAN RESET PASSWORD -->
    <section class="dashboard-section reset-section">

        <h2 class="reset-card-title">Permintaan Reset Password</h2>

        <div class="reset-card-body">
            <span class="reset-user-name">Erik</span>

            <button type="button" class="btn-reset-password">
                Reset Password
            </button>
        </div>

    </section>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
