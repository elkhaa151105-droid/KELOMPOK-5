<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_role(['owner', 'barber']);
require_once __DIR__ . '/../config/config.php';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$layananStmt = $pdo->query(
    "SELECT id_layanan, nama_layanan, harga
     FROM layanan
     WHERE aktif = 1
     ORDER BY CASE WHEN LOWER(nama_layanan) = 'creambath' THEN 1 ELSE 0 END,
              nama_layanan ASC, id_layanan ASC"
);
$layanan = $layananStmt->fetchAll(PDO::FETCH_ASSOC);

$barberStmt = $pdo->query(
    "SELECT id_user, nama, role
     FROM users
     WHERE aktif = 1 AND role IN ('barber', 'owner')
     ORDER BY nama ASC"
);
$daftarBarber = $barberStmt->fetchAll(PDO::FETCH_ASSOC);

$iconByType = require __DIR__ . '/kasir_icons.php';
$errorMessages = [
    'no_service' => 'Pilih minimal satu layanan.',
    'customer_required' => 'Nama pelanggan wajib diisi.',
    'price_invalid' => 'Harga atau total transaksi tidak valid.',
    'invalid_barber' => 'Pilih barber yang valid.',
    'payment_required' => 'Pilih metode pembayaran.',
    'invalid' => 'Data transaksi tidak valid atau sesi formulir kedaluwarsa.',
    'failed' => 'Transaksi gagal disimpan. Silakan coba lagi.'
];
$error = $errorMessages[$_GET['error'] ?? ''] ?? '';
$success = ($_GET['success'] ?? '') === '1';

include __DIR__ . '/../includes/header.php';
?>

<div class="kasir-page">
    <div class="kasir-heading">
        <h1>Kasir</h1>
        <p>Pricelist - Klik untuk tambah (hanya layanan aktif)</p>
    </div>

    <?php if ($error !== ''): ?>
        <div class="kasir-message kasir-message-error" role="alert">
            <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
        </div>
    <?php elseif ($success): ?>
        <div class="kasir-message kasir-message-success" role="status">
            Transaksi berhasil disimpan.
        </div>
    <?php endif; ?>

    <form id="kasirForm" method="POST" action="/KELOMPOK-5/pages/catat_transaksi_proses.php" novalidate>
        <input
            type="hidden"
            name="csrf_token"
            value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>"
        >

        <div class="kasir-layout">
            <section class="kasir-services" aria-label="Daftar layanan">
                <?php if (!$layanan): ?>
                    <p class="kasir-empty-services">Belum ada layanan aktif.</p>
                <?php else: ?>
                    <?php foreach ($layanan as $index => $item): ?>
                        <?php
                        $namaLayanan = (string) $item['nama_layanan'];
                        $namaNormal = strtolower($namaLayanan);
                        $jenisIkon = match (true) {
                            str_contains($namaNormal, 'color') => 'coloring',
                            str_contains($namaNormal, 'perm') => 'perming',
                            str_contains($namaNormal, 'smooth') => 'smoothing',
                            str_contains($namaNormal, 'cream') => 'creambath',
                            default => 'haircut'
                        };
                        ?>
                        <button
                            type="button"
                            class="service-card"
                            data-service-id="<?= (int) $item['id_layanan'] ?>"
                            data-service-name="<?= htmlspecialchars($namaLayanan, ENT_QUOTES, 'UTF-8') ?>"
                            data-price="<?= (int) $item['harga'] ?>"
                            aria-pressed="false"
                        >
                            <span class="service-icon">
                                <img
                                    src="<?= htmlspecialchars($iconByType[$jenisIkon], ENT_QUOTES, 'UTF-8') ?>"
                                    alt=""
                                    aria-hidden="true"
                                >
                            </span>
                            <span class="service-info">
                                <strong><?= htmlspecialchars($namaLayanan, ENT_QUOTES, 'UTF-8') ?></strong>
                                <small>Rp<?= number_format((int) $item['harga'], 0, ',', '.') ?></small>
                            </span>
                        </button>
                    <?php endforeach; ?>
                <?php endif; ?>
            </section>

            <aside class="kasir-order-card" aria-labelledby="kasirOrderTitle">
                <h2 id="kasirOrderTitle">Layanan</h2>

                <div class="kasir-field">
                    <label for="namaPelanggan">Nama Pelanggan</label>
                    <input
                        type="text"
                        id="namaPelanggan"
                        name="nama_pelanggan"
                        required
                        maxlength="100"
                        placeholder="Ketik di sini..."
                    >
                </div>

                <div class="kasir-field">
                    <label for="namaBarber">Nama Barber</label>
                    <select
                        id="namaBarber"
                        <?= ($_SESSION['role'] ?? '') === 'barber' ? 'disabled' : 'name="id_barber" required' ?>
                    >
                        <option value="">Pilih barber...</option>
                        <?php foreach ($daftarBarber as $barber): ?>
                            <option
                                value="<?= (int) $barber['id_user'] ?>"
                                <?= (int) $barber['id_user'] === (int) ($_SESSION['id_user'] ?? 0) ? 'selected' : '' ?>
                            >
                                <?= htmlspecialchars($barber['nama'], ENT_QUOTES, 'UTF-8') ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <?php if (($_SESSION['role'] ?? '') === 'barber'): ?>
                        <input type="hidden" name="id_barber" value="<?= (int) ($_SESSION['id_user'] ?? 0) ?>">
                    <?php endif; ?>
                </div>

                <div class="kasir-selected-service">
                    <div class="selected-service-heading"><span>Service</span></div>
                    <div id="selectedServices" class="selected-services-list" aria-live="polite">
                        <p class="empty-service">Belum ada layanan dipilih</p>
                    </div>
                    <div id="kasirHiddenServices"></div>
                </div>

                <div class="kasir-total">
                    <span>Total</span>
                    <strong id="kasirTotal">Rp0</strong>
                </div>

                <div class="kasir-field payment-field">
                    <label for="metodePembayaran">Metode Pembayaran</label>
                    <select id="metodePembayaran" name="metode_pembayaran" required>
                        <option value="">Pilih...</option>
                        <option value="cash">Cash</option>
                        <option value="qris">QRIS</option>
                        <option value="transfer">Transfer</option>
                    </select>
                </div>

                <p id="kasirError" class="kasir-inline-error" role="alert" hidden></p>
                <button type="submit" class="kasir-submit" id="btnSimpanTransaksi">
                    Simpan Transaksi
                </button>
            </aside>
        </div>
    </form>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
