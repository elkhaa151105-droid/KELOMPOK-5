
<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_login();

$role = $_SESSION['role'] ?? '';

if ($role !== 'owner') {
    header('Location: dashboard.php');
    exit;
}

include __DIR__ . '/../includes/header.php';
?>

<div class="pengeluaran-page">
    <div class="pengeluaran-heading">
        <h1>Pengeluaran/HPP</h1>
        <p>Catat dan pantau pengeluaran operasional harian</p>
    </div>

    <!-- Kartu total pengeluaran -->
    <section class="pengeluaran-total-card">
        <div class="pengeluaran-total-info">
            <h2>Total Pengeluaran</h2>
            <strong id="totalPengeluaranHarian">Rp0</strong>
            <p>
                <span>Periode:</span>
                <span id="periodePengeluaran">-</span>
            </p>
        </div>

        <div class="pengeluaran-filter">
            <label for="tanggalPengeluaranHarian">Tanggal</label>
            <input type="date" id="tanggalPengeluaranHarian">
        </div>
    </section>

    <!-- Daftar pengeluaran -->
    <section class="pengeluaran-list-card">
        <div class="pengeluaran-list-header">
            <h2>Daftar Pengeluaran</h2>

            <button type="button" id="btnTampilkanFormPengeluaran">
                + Tambah Pengeluaran
            </button>
        </div>

        <!-- Form tambah pengeluaran -->
        <form id="formPengeluaranHarian" class="pengeluaran-form" hidden>
            <div class="pengeluaran-form-group">
                <label for="kategoriPengeluaranHarian">Kategori</label>
                <select id="kategoriPengeluaranHarian" required>
                    <option value="">Pilih kategori</option>
                    <option value="Bahan">Bahan</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Peralatan">Peralatan</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>

            <div class="pengeluaran-form-group">
                <label for="nominalPengeluaranHarian">Nominal (Rp)</label>
                <input
                    type="number"
                    id="nominalPengeluaranHarian"
                    min="1"
                    step="1"
                    placeholder="Masukkan nominal"
                    required
                >
                <small id="errorNominalPengeluaranHarian" role="alert"></small>
            </div>

            <div class="pengeluaran-form-group">
                <label for="keteranganPengeluaranHarian">Keterangan</label>
                <input
                    type="text"
                    id="keteranganPengeluaranHarian"
                    placeholder="Contoh: Pembelian perlengkapan"
                >
            </div>

            <div class="pengeluaran-form-actions">
                <button type="submit" id="btnSimpanPengeluaran">
                    Simpan Pengeluaran
                </button>
                <button type="button" id="btnBatalPengeluaran">
                    Batal
                </button>
            </div>
        </form>

        <p
            id="statusPengeluaranHarian"
            class="pengeluaran-status"
            role="status"
            aria-live="polite"
        >Memuat data pengeluaran...</p>

        <div class="pengeluaran-table-wrapper">
            <table class="pengeluaran-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                        <th>Nominal</th>
                    </tr>
                </thead>
                <tbody id="daftarPengeluaranHarian"></tbody>
            </table>
        </div>
    </section>
</div>

<script src="/KELOMPOK-5/assets/js/pengeluaran.js"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
