
<?php
require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner']);

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

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

    case 'status_sukses':
        $message = 'Status layanan berhasil diperbarui.';
        break;

    case 'hapus_sukses':
        $message = 'Layanan berhasil dihapus.';
        break;

    case 'layanan_digunakan':
        $message = 'Layanan yang tercatat pada transaksi tidak dapat dihapus.';
        $message_type = 'error';
        break;

    case 'harga_invalid':
        $message = 'Harga harus lebih dari nol.';
        $message_type = 'error';
        break;

    case 'hpp_invalid':
        $message = 'HPP wajib diisi dengan bilangan bulat nol atau lebih.';
        $message_type = 'error';
        break;

    case 'nama_kosong':
        $message = 'Nama layanan wajib diisi.';
        $message_type = 'error';
        break;

    case 'nama_invalid':
        $message = 'Nama layanan maksimal 100 karakter dan tidak boleh duplikat.';
        $message_type = 'error';
        break;

    case 'gagal':
        $message = 'Terjadi kesalahan. Silakan coba lagi.';
        $message_type = 'error';
        break;
}

$stmt = $pdo->query(
    'SELECT id_layanan, nama_layanan, harga, hpp, aktif, dibuat_pada
     FROM layanan
     ORDER BY id_layanan DESC'
);

$layanan = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="layanan-page">

    <!-- Judul halaman -->
    <div class="layanan-heading">
        <h1>Layanan</h1>
    </div>

    <!-- Notifikasi dari API -->
    <div
        id="layananNotifikasi"
        class="layanan-notifikasi"
        role="status"
        aria-live="polite"
    ></div>

    <!-- Tabel daftar layanan -->
    <div class="layanan-card">
        <div class="layanan-table-wrapper">
            <table class="layanan-table layanan-table-crud">
                <thead>
                    <tr>
                        <th>Layanan</th>
                        <th>Harga</th>
                        <th>HPP</th>
                        <th>Aktif</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody id="layananTableBody">
                    <tr>
                        <td colspan="5">Memuat data layanan...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Form tambah layanan -->
    <div class="layanan-card tambah-layanan-card">
        <h2>Tambah Layanan</h2>

        <form id="formTambahLayanan" class="tambah-layanan-form" novalidate>

            <div class="layanan-input-group">
                <label for="namaLayanan">Nama</label>
                <input
                    type="text"
                    id="namaLayanan"
                    maxlength="100"
                >
                <span
                    id="errorNamaLayanan"
                    class="layanan-error"
                ></span>
            </div>

            <div class="layanan-input-group">
                <label for="hargaLayanan">Harga</label>
                <input
                    type="number"
                    id="hargaLayanan"
                    min="1"
                >
                <span
                    id="errorHargaLayanan"
                    class="layanan-error"
                ></span>
            </div>

            <div class="layanan-input-group">
                <label for="hppLayanan">HPP</label>
                <input
                    type="number"
                    id="hppLayanan"
                    min="1"
                    step="1"
                >
                <span
                    id="errorHppLayanan"
                    class="layanan-error"
                ></span>
            </div>

            <button type="submit" class="layanan-submit">
                Tambah
            </button>

        </form>
    </div>

</div>

<!-- Modal Edit Layanan -->
<div
    id="modalEditLayanan"
    class="layanan-modal-overlay"
    aria-hidden="true"
>
    <div
        class="layanan-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="judulModalEditLayanan"
    >

        <!-- Header modal -->
        <div class="layanan-modal-header">
            <h2 id="judulModalEditLayanan">Edit Layanan</h2>

            <button
                type="button"
                id="tutupModalEditLayanan"
                class="layanan-modal-close"
                aria-label="Tutup modal"
            >
                &times;
            </button>
        </div>

        <!-- Form edit -->
        <form id="formEditLayanan" novalidate>

            <input
                type="hidden"
                id="editIdLayanan"
            >

            <div class="layanan-modal-body">

                <div class="layanan-modal-group">
                    <label for="editNamaLayanan">
                        Nama Layanan
                    </label>

                    <input
                        type="text"
                        id="editNamaLayanan"
                        placeholder="Masukkan nama layanan"
                        maxlength="100"
                    >

                    <span
                        id="errorEditNamaLayanan"
                        class="layanan-error"
                    ></span>
                </div>

                <!-- Ikon mengikuti desain; belum dikirim ke API -->
                <div class="layanan-modal-group">
                    <label for="editIconLayanan">
                        Icon Layanan
                    </label>

                    <input
                        type="file"
                        id="editIconLayanan"
                        accept="image/png,image/jpeg,image/webp"
                    >

                    <small class="layanan-modal-hint">
                        *Format .PNG, .JPG, .WEBP Maks 2 mb
                    </small>
                </div>

                <div class="layanan-modal-group">
                    <label for="editHargaLayanan">
                        Harga
                    </label>

                    <input
                        type="number"
                        id="editHargaLayanan"
                        min="1"
                        placeholder="Masukkan harga layanan"
                    >

                    <span
                        id="errorEditHargaLayanan"
                        class="layanan-error"
                    ></span>
                </div>

                <div class="layanan-modal-group">
                    <label for="editHppLayanan">
                        HPP
                    </label>

                    <input
                        type="number"
                        id="editHppLayanan"
                        min="1"
                        step="1"
                        placeholder="Masukkan HPP"
                    >

                    <span
                        id="errorEditHppLayanan"
                        class="layanan-error"
                    ></span>
                </div>

            </div>

            <!-- Tombol simpan -->
            <div class="layanan-modal-footer">
                <button
                    type="submit"
                    id="simpanEditLayanan"
                    class="layanan-modal-submit"
                >
                    Simpan Layanan
                </button>
            </div>

        </form>

    </div>
</div>

<script src="/KELOMPOK-5/assets/js/layanan.js"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
