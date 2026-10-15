<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_login();

$role = $_SESSION['role'] ?? '';
$nama = $_SESSION['nama'] ?? '';

// Format sapaan sesuai role & nama
$display_role = ($role === 'owner') ? 'Owner Kataji' : ($nama ?: 'Barber');

$periode = $_GET['periode'] ?? 'today';
if (!in_array($periode, ['today', 'week', 'month'], true)) {
    $periode = 'today';
}

$zonaWib = new DateTimeZone('Asia/Jakarta');
$hariIni = new DateTimeImmutable('today', $zonaWib);
$tanggalMulai = match ($periode) {
    'week' => $hariIni->modify('monday this week'),
    'month' => $hariIni->modify('first day of this month'),
    default => $hariIni,
};
$tanggalAkhir = match ($periode) {
    'week' => $tanggalMulai->modify('+6 days'),
    'month' => $tanggalMulai->modify('last day of this month'),
    default => $hariIni,
};
$rentangLabel = match ($periode) {
    'week' => 'Minggu Ini',
    'month' => 'Bulan Ini',
    default => 'Hari Ini',
};
$tanggalMulaiSql = $tanggalMulai->format('Y-m-d');
$tanggalAkhirSql = $tanggalAkhir->format('Y-m-d');

$whereTransaksi = 'tanggal BETWEEN ? AND ?';
$parameterTransaksi = [$tanggalMulaiSql, $tanggalAkhirSql];
if ($role === 'barber') {
    $whereTransaksi .= ' AND id_barber = ?';
    $parameterTransaksi[] = (int) ($_SESSION['id_user'] ?? 0);
}
$stmtRingkasan = $pdo->prepare(
    "SELECT COUNT(DISTINCT id_pelanggan) AS jumlah_pelanggan,
            COUNT(*) AS jumlah_transaksi,
            COALESCE(SUM(total_harga), 0) AS pendapatan
     FROM transaksi
     WHERE {$whereTransaksi}"
);
$stmtRingkasan->execute($parameterTransaksi);
$ringkasan = $stmtRingkasan->fetch(PDO::FETCH_ASSOC) ?: [];

$wherePengeluaran = 'tanggal BETWEEN ? AND ?';
$parameterPengeluaran = [$tanggalMulaiSql, $tanggalAkhirSql];
if ($role === 'barber') {
    $wherePengeluaran .= ' AND id_user = ?';
    $parameterPengeluaran[] = (int) ($_SESSION['id_user'] ?? 0);
}
$stmtPengeluaran = $pdo->prepare(
    "SELECT COALESCE(SUM(nominal), 0)
     FROM pengeluaran
     WHERE {$wherePengeluaran}"
);
$stmtPengeluaran->execute($parameterPengeluaran);
$totalPengeluaran = (int) $stmtPengeluaran->fetchColumn();

$whereHpp = 't.tanggal BETWEEN ? AND ?';
$parameterHpp = [$tanggalMulaiSql, $tanggalAkhirSql];
if ($role === 'barber') {
    $whereHpp .= ' AND t.id_barber = ?';
    $parameterHpp[] = (int) ($_SESSION['id_user'] ?? 0);
}
$stmtHpp = $pdo->prepare(
    "SELECT COALESCE(SUM(dt.hpp_saat_transaksi * dt.jumlah), 0) AS total_hpp,
            SUM(CASE WHEN dt.id_detail IS NULL OR dt.hpp_saat_transaksi IS NULL THEN 1 ELSE 0 END) AS detail_tanpa_hpp
     FROM transaksi t
     LEFT JOIN detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
     WHERE {$whereHpp}"
);
$stmtHpp->execute($parameterHpp);
$ringkasanHpp = $stmtHpp->fetch(PDO::FETCH_ASSOC) ?: [];
$totalHpp = (int) ($ringkasanHpp['total_hpp'] ?? 0);
$hppLengkap = (int) ($ringkasanHpp['detail_tanpa_hpp'] ?? 0) === 0;

$stmtBarber = $pdo->query(
    "SELECT nama, spesialisasi
     FROM users
     WHERE role = 'barber' AND aktif = 1
     ORDER BY nama ASC"
);
$barberAktif = $stmtBarber->fetchAll(PDO::FETCH_ASSOC);

$formatRupiah = static fn (int $nilai): string => 'Rp' . number_format($nilai, 0, ',', '.');
$pendapatan = (int) ($ringkasan['pendapatan'] ?? 0);
$jumlahPelanggan = (int) ($ringkasan['jumlah_pelanggan'] ?? 0);
$jumlahTransaksi = (int) ($ringkasan['jumlah_transaksi'] ?? 0);
$labaKotor = $hppLengkap ? $pendapatan - $totalHpp : null;
$labaBersih = $labaKotor === null ? null : $labaKotor - $totalPengeluaran;
$labelHpp = $hppLengkap ? $formatRupiah($totalHpp) : '—';
$labelLabaKotor = $labaKotor === null ? '—' : $formatRupiah($labaKotor);
$labelLabaBersih = $labaBersih === null ? '—' : $formatRupiah($labaBersih);
$keteranganHpp = 'Nilai HPP historis belum tersedia untuk seluruh detail transaksi pada periode ini.';
$keteranganLaba = 'Laba belum dapat dihitung karena data HPP historis belum lengkap.';
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
                <span class="summary-title">Pelanggan <?= htmlspecialchars($rentangLabel, ENT_QUOTES, 'UTF-8') ?></span>
            </div>
            <strong class="summary-value"><?= number_format($jumlahPelanggan, 0, ',', '.') ?></strong>
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
                <span class="summary-title">Transaksi <?= htmlspecialchars($rentangLabel, ENT_QUOTES, 'UTF-8') ?></span>
            </div>
            <strong class="summary-value"><?= number_format($jumlahTransaksi, 0, ',', '.') ?></strong>
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
                <span class="summary-title">Pendapatan <?= htmlspecialchars($rentangLabel, ENT_QUOTES, 'UTF-8') ?></span>
            </div>
            <strong class="summary-value"><?= htmlspecialchars($formatRupiah($pendapatan), ENT_QUOTES, 'UTF-8') ?></strong>
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
                <span class="summary-title">Laba Kotor <?= htmlspecialchars($rentangLabel, ENT_QUOTES, 'UTF-8') ?></span>
            </div>
            <strong class="summary-value"<?= $labaKotor === null ? ' title="' . htmlspecialchars($keteranganLaba, ENT_QUOTES, 'UTF-8') . '"' : '' ?>><?= htmlspecialchars($labelLabaKotor, ENT_QUOTES, 'UTF-8') ?></strong>
        </div>

    </div>


    <!-- REKAP KEUANGAN -->
    <section class="dashboard-section rekap-card">

        <div class="rekap-header">
            <h2>Rekap Keuangan</h2>

            <div class="period-filter">
                <a href="?periode=today" class="filter-btn <?= $periode === 'today' ? 'active' : '' ?>">Hari Ini</a>
                <a href="?periode=week" class="filter-btn <?= $periode === 'week' ? 'active' : '' ?>">Minggu Ini</a>
                <a href="?periode=month" class="filter-btn <?= $periode === 'month' ? 'active' : '' ?>">Bulan Ini</a>
            </div>
        </div>

        <div class="financial-metrics">

            <div class="metric-item">
                <span class="metric-label">Pendapatan</span>
                <strong class="metric-val"><?= htmlspecialchars($formatRupiah($pendapatan), ENT_QUOTES, 'UTF-8') ?></strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">HPP</span>
                <strong class="metric-val"<?= !$hppLengkap ? ' title="' . htmlspecialchars($keteranganHpp, ENT_QUOTES, 'UTF-8') . '"' : '' ?>><?= htmlspecialchars($labelHpp, ENT_QUOTES, 'UTF-8') ?></strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">Laba Kotor</span>
                <strong class="metric-val"<?= $labaKotor === null ? ' title="' . htmlspecialchars($keteranganLaba, ENT_QUOTES, 'UTF-8') . '"' : '' ?>><?= htmlspecialchars($labelLabaKotor, ENT_QUOTES, 'UTF-8') ?></strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">Biaya Operasional</span>
                <strong class="metric-val"><?= htmlspecialchars($formatRupiah($totalPengeluaran), ENT_QUOTES, 'UTF-8') ?></strong>
            </div>

            <div class="metric-item">
                <span class="metric-label">Laba Bersih</span>
                <strong class="metric-val"<?= $labaBersih === null ? ' title="' . htmlspecialchars($keteranganLaba, ENT_QUOTES, 'UTF-8') . '"' : '' ?>><?= htmlspecialchars($labelLabaBersih, ENT_QUOTES, 'UTF-8') ?></strong>
            </div>

        </div>

    </section>


    <!-- BARBER AKTIF -->
    <section class="barber-section">

        <h2 class="section-title">Barber Aktif</h2>

        <div class="barber-grid">
            <?php if (!$barberAktif): ?>
                <p>Belum ada akun barber aktif.</p>
            <?php else: ?>
                <?php foreach ($barberAktif as $barber): ?>
                    <article class="barber-card">
                        <div class="barber-photo-box" aria-hidden="true">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div class="barber-details">
                            <h3 class="barber-name"><?= htmlspecialchars($barber['nama'], ENT_QUOTES, 'UTF-8') ?></h3>
                            <p class="barber-specialty">
                                Spesialis:<br>
                                <?= htmlspecialchars($barber['spesialisasi'] ?: 'Belum diatur', ENT_QUOTES, 'UTF-8') ?>
                            </p>
                            <span class="barber-badge badge-hadir">
                                <span class="badge-dot"></span> Akun aktif
                            </span>
                        </div>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

    </section>


    <!-- PERMINTAAN RESET PASSWORD -->
    <section class="dashboard-section reset-section">

        <h2 class="reset-card-title">Permintaan Reset Password</h2>

        <div class="reset-card-body">
            <span class="reset-user-name">Pengelolaan permintaan reset password belum tersedia.</span>
        </div>

    </section>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
