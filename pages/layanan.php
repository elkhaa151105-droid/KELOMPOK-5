<?php
require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner']);

$status = $_GET['status'] ?? '';
$message = '';
$message_type = 'success';

switch ($status) {
    case 'tambah_sukses':
        $message = 'Layanan berhasil ditambahkan.';
        break;

    case 'ubah_sukses':
        $message = 'Layanan berhasil diperbarui.';
        break;

    case 'nonaktif_sukses':
        $message = 'Layanan berhasil dinonaktifkan.';
        break;

    case 'harga_invalid':
        $message = 'Harga harus lebih dari nol';
        $message_type = 'error';
        break;

    case 'nama_kosong':
        $message = 'Nama layanan wajib diisi.';
        $message_type = 'error';
        break;

    case 'gagal':
        $message = 'Terjadi kesalahan. Silakan coba lagi.';
        $message_type = 'error';
        break;
}

// Ambil layanan yang masih aktif
$stmt = $pdo->query(
    'SELECT id_layanan, nama_layanan, harga, dibuat_pada
     FROM layanan
     WHERE aktif = 1
     ORDER BY id_layanan DESC'
);

$layanan = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="dashboard-page">

    <div class="dashboard-heading">
        <h1>Layanan &amp; Pricelist</h1>
        <p>Kelola daftar layanan dan harga Kataji Barber.</p>
    </div>

    <?php if ($message !== ''): ?>
        <div style="
            margin-bottom: 20px;
            padding: 14px 18px;
            border-radius: 10px;
            background: <?= $message_type === 'error' ? '#FDECEC' : '#EEF8F1' ?>;
            border: 1px solid <?= $message_type === 'error' ? '#F3B5B5' : '#B9E3C5' ?>;
            color: <?= $message_type === 'error' ? '#B42318' : '#267A43' ?>;
            font-weight: 600;
        ">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>


    <!-- TAMBAH LAYANAN -->
    <div class="dashboard-section" style="
        padding: 24px;
        background: #FFFFFF;
        border-radius: 14px;
        border: 1px solid #E2E4F0;
        margin-bottom: 24px;
    ">

        <h2 style="margin-top: 0;">Tambah Layanan</h2>

        <form action="/KELOMPOK-5/pages/layanan_proses.php" method="POST">

            <input type="hidden" name="action" value="tambah">

            <div style="margin-bottom: 16px;">
                <label for="nama_layanan"
                       style="display:block; margin-bottom:8px; font-weight:600;">
                    Nama Layanan
                </label>

                <input
                    type="text"
                    id="nama_layanan"
                    name="nama_layanan"
                    maxlength="100"
                    required
                    placeholder="Contoh: Potong Rambut"
                    style="
                        width:100%;
                        padding:12px 14px;
                        border:1px solid #D9DCE8;
                        border-radius:8px;
                        box-sizing:border-box;
                    "
                >
            </div>

            <div style="margin-bottom: 16px;">
                <label for="harga"
                       style="display:block; margin-bottom:8px; font-weight:600;">
                    Harga
                </label>

                <input
                    type="number"
                    id="harga"
                    name="harga"
                    min="1"
                    step="1"
                    required
                    placeholder="Contoh: 25000"
                    style="
                        width:100%;
                        padding:12px 14px;
                        border:1px solid #D9DCE8;
                        border-radius:8px;
                        box-sizing:border-box;
                    "
                >
            </div>

            <button
                type="submit"
                style="
                    padding:11px 20px;
                    border:0;
                    border-radius:8px;
                    background:#253B80;
                    color:white;
                    font-weight:600;
                    cursor:pointer;
                "
            >
                + Simpan Layanan
            </button>

        </form>
    </div>


    <!-- DAFTAR LAYANAN -->
    <div class="dashboard-section" style="
        padding: 24px;
        background: #FFFFFF;
        border-radius: 14px;
        border: 1px solid #E2E4F0;
    ">

        <h2 style="margin-top: 0;">Daftar Layanan Aktif</h2>

        <?php if (empty($layanan)): ?>

            <p style="color:#666;">
                Belum ada layanan aktif.
            </p>

        <?php else: ?>

            <div style="overflow-x:auto;">

                <table style="
                    width:100%;
                    border-collapse:collapse;
                ">

                    <thead>
                        <tr style="border-bottom:2px solid #E2E4F0;">
                            <th style="padding:12px; text-align:left;">No</th>
                            <th style="padding:12px; text-align:left;">Nama Layanan</th>
                            <th style="padding:12px; text-align:left;">Harga</th>
                            <th style="padding:12px; text-align:left;">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>

                        <?php foreach ($layanan as $index => $item): ?>

                            <tr style="border-bottom:1px solid #E2E4F0;">

                                <td style="padding:12px;">
                                    <?= $index + 1 ?>
                                </td>

                                <td style="padding:12px;">
                                    <?= htmlspecialchars($item['nama_layanan']) ?>
                                </td>

                                <td style="padding:12px; font-weight:600;">
                                    Rp <?= number_format((int) $item['harga'], 0, ',', '.') ?>
                                </td>

                                <td style="padding:12px;">

                                    <!-- UBAH LAYANAN -->
                                    <form
                                        action="/KELOMPOK-5/pages/layanan_proses.php"
                                        method="POST"
                                        style="margin-bottom:10px;"
                                    >

                                        <input type="hidden"
                                               name="action"
                                               value="ubah">

                                        <input type="hidden"
                                               name="id_layanan"
                                               value="<?= (int) $item['id_layanan'] ?>">

                                        <input
                                            type="text"
                                            name="nama_layanan"
                                            value="<?= htmlspecialchars($item['nama_layanan']) ?>"
                                            maxlength="100"
                                            required
                                            style="
                                                padding:8px;
                                                width:180px;
                                                border:1px solid #D9DCE8;
                                                border-radius:6px;
                                                margin-right:5px;
                                            "
                                        >

                                        <input
                                            type="number"
                                            name="harga"
                                            value="<?= (int) $item['harga'] ?>"
                                            min="1"
                                            step="1"
                                            required
                                            style="
                                                padding:8px;
                                                width:120px;
                                                border:1px solid #D9DCE8;
                                                border-radius:6px;
                                                margin-right:5px;
                                            "
                                        >

                                        <button
                                            type="submit"
                                            style="
                                                padding:8px 12px;
                                                border:0;
                                                border-radius:6px;
                                                background:#253B80;
                                                color:white;
                                                cursor:pointer;
                                            "
                                        >
                                            Simpan
                                        </button>

                                    </form>


                                    <!-- NONAKTIFKAN LAYANAN -->
                                    <form
                                        action="/KELOMPOK-5/pages/layanan_proses.php"
                                        method="POST"
                                        onsubmit="return confirm('Yakin ingin menonaktifkan layanan ini?');"
                                    >

                                        <input type="hidden"
                                               name="action"
                                               value="nonaktifkan">

                                        <input type="hidden"
                                               name="id_layanan"
                                               value="<?= (int) $item['id_layanan'] ?>">

                                        <button
                                            type="submit"
                                            style="
                                                padding:8px 12px;
                                                border:0;
                                                border-radius:6px;
                                                background:#D9534F;
                                                color:white;
                                                cursor:pointer;
                                            "
                                        >
                                            Nonaktifkan
                                        </button>

                                    </form>

                                </td>

                            </tr>

                        <?php endforeach; ?>

                    </tbody>

                </table>

            </div>

        <?php endif; ?>

    </div>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>