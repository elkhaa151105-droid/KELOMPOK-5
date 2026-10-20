
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

<main class="pemasukan-page">
    <header class="pemasukan-heading">
        <div>
            <h1>Pemasukan</h1>
            <p>Rekap pemasukan harian dari transaksi</p>
        </div>
    </header>

    <section class="pemasukan-card">
        <div class="pemasukan-card-header">
            <h2>Pemasukan Harian</h2>

            <div class="pemasukan-date">
                <label for="tanggalPemasukan">Tanggal</label>
                <input type="date" id="tanggalPemasukan">
            </div>
        </div>

        <div class="pemasukan-total-row">
            <span>Total Pemasukan</span>
            <strong id="totalPemasukan">Rp0</strong>
        </div>

        <div class="pemasukan-detail">
            <h3>Rincian Per Barber</h3>

            <p id="statusPemasukan" role="status" aria-live="polite">
                Memuat data pemasukan...
            </p>

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
        </div>
    </section>
</main>

<?php include __DIR__ . '/../includes/footer.php'; ?>
