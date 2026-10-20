<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_login();

// Halaman pengeluaran hanya bisa diakses oleh owner.
$role = $_SESSION['role'] ?? '';

if ($role !== 'owner') {
    header('Location: dashboard.php');
    exit;
}

include __DIR__ . '/../includes/header.php';
?>

<div class="pengeluaran-page">

    <!-- Judul halaman mengikuti Figma -->
    <div class="pengeluaran-heading">
        <h1>Pengeluaran</h1>
    </div>

    <!-- Ringkasan pengeluaran -->
    <section class="pengeluaran-summary-card">
        <div class="pengeluaran-summary-header">
            <h2>Ringkasan Pengeluaran</h2>

            <!-- Pilihan periode sebagai elemen UI Figma.
                 Perhitungan tetap mengikuti tanggal dari Trello. -->
            <div class="pengeluaran-period-options">
                <button type="button" class="active" aria-pressed="true">
                    Hari Ini
                </button>
                <button type="button" aria-pressed="false">
                    Minggu Ini
                </button>
                <button type="button" aria-pressed="false">
                    Bulan Ini
                </button>
                <button type="button" aria-pressed="false">
                    Semua
                </button>
            </div>
        </div>

        <div class="pengeluaran-summary-content">
            <div class="pengeluaran-summary-item">
                <span>Total Pengeluaran</span>
                <strong id="totalRingkasanPengeluaran">Rp0</strong>
            </div>
        </div>
    </section>

    <!-- Form pencatatan pengeluaran -->
    <section class="pengeluaran-form-card">
        <div class="pengeluaran-card-heading">
            <h2>Catat Pengeluaran</h2>
        </div>

        <form id="formPengeluaranHarian" class="pengeluaran-form">
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

            <div class="pengeluaran-form-actions">
                <button type="submit" id="btnSimpanPengeluaran">
                    Simpan
                </button>
            </div>
        </form>
    </section>


<!-- Pengeluaran berdasarkan tanggal yang dipilih -->
<section class="pengeluaran-daily-card">
    <div class="pengeluaran-daily-header">
        <h2>Pengeluaran Hari Ini</h2>

        <div class="pengeluaran-date-filter">
            <label for="tanggalPengeluaranHarian">Tanggal</label>
            <input type="date" id="tanggalPengeluaranHarian">
        </div>
    </div>

    <p
        id="statusPengeluaranHarian"
        class="pengeluaran-status"
        role="status"
        aria-live="polite"
    >
        Memuat data pengeluaran...
    </p>

    <!-- Daftar pengeluaran digabung dalam card ini -->
    <div class="pengeluaran-table-wrapper">
        <table class="pengeluaran-table">
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Nominal</th>
                </tr>
            </thead>
            <tbody id="daftarPengeluaranHarian"></tbody>
        </table>
    </div>

    <!-- Total pengeluaran berada di bagian bawah card -->
    <div class="pengeluaran-daily-total">
        <span>Total Pengeluaran</span>
        <strong id="totalPengeluaranHarian">Rp0</strong>
    </div>

    <span id="periodePengeluaran" hidden></span>
</section>

    
</div>

<script src="/KELOMPOK-5/assets/js/pengeluaran.js"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
