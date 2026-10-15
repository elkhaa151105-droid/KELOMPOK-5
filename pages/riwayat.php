<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_role(['owner', 'barber']);
require_once __DIR__ . '/../config/config.php';

$params = [];
$where = '';
if (($_SESSION['role'] ?? '') === 'barber') {
    $where = 'WHERE t.id_barber = ?';
    $params[] = (int) $_SESSION['id_user'];
}

$stmtRiwayat = $pdo->prepare(
    "SELECT t.id_transaksi, t.tanggal, t.waktu, t.total_harga,
            t.metode_pembayaran, p.nama AS nama_pelanggan,
            GROUP_CONCAT(
                CONCAT(l.nama_layanan, ' (', dt.jumlah, 'x)')
                ORDER BY dt.id_detail SEPARATOR ', '
            ) AS layanan
     FROM transaksi t
     LEFT JOIN pelanggan p ON p.id_pelanggan = t.id_pelanggan
     JOIN detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
     JOIN layanan l ON l.id_layanan = dt.id_layanan
     $where
     GROUP BY t.id_transaksi, t.tanggal, t.waktu, t.total_harga,
              t.metode_pembayaran, p.nama
     ORDER BY t.tanggal DESC, t.waktu DESC, t.id_transaksi DESC
     LIMIT 200"
);
$stmtRiwayat->execute($params);
$transaksiRiwayat = $stmtRiwayat->fetchAll(PDO::FETCH_ASSOC);

include __DIR__ . '/../includes/header.php';
?>

<div class="riwayat-page">
    <div class="riwayat-heading"><h1>Riwayat</h1></div>
    <div class="riwayat-card">
        <div class="riwayat-table-wrapper">
            <table class="riwayat-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Tgl-Bln-Thn</th>
                        <th>Layanan</th>
                        <th>Nominal</th>
                        <th>Metode Pembayaran</th>
                        <th aria-label="Aksi"></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!$transaksiRiwayat): ?>
                        <tr><td colspan="6">Belum ada transaksi tersimpan.</td></tr>
                    <?php else: ?>
                        <?php foreach ($transaksiRiwayat as $item): ?>
                            <tr>
                                <td><?= htmlspecialchars($item['nama_pelanggan'] ?: 'Pelanggan umum', ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars(date('d-m-Y', strtotime($item['tanggal'])), ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($item['layanan'] ?? '', ENT_QUOTES, 'UTF-8') ?></td>
                                <td>Rp<?= number_format((int) $item['total_harga'], 0, ',', '.') ?></td>
                                <td><?= htmlspecialchars(strtoupper($item['metode_pembayaran']), ENT_QUOTES, 'UTF-8') ?></td>
                                <td></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
