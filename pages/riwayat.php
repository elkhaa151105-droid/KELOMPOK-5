<?php
require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner', 'barber']);

include __DIR__ . '/../includes/header.php';
?>

<div class="riwayat-page">

    <div class="riwayat-heading">
        <h1>Riwayat</h1>
    </div>

    <div class="riwayat-card">

        <!-- NOTIFIKASI -->
        <div id="riwayatNotification" class="transaction-success riwayat-delete-notification">
         Berhasil Dihapus
        </div>

        <div class="riwayat-table-wrapper">
            <table class="riwayat-table">

                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Tgl-Bln-Thn</th>
                        <th>Layanan</th>
                        <th>Nominal</th>
                        <th>Metode Pembayaran</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody id="riwayatTableBody">

                    <!-- DATA SEMENTARA -->
                    <tr>
                        <td>Farid</td>
                        <td>01-10-2026</td>
                        <td>Haircut</td>
                        <td>Rp50.000</td>
                        <td>Rp50.000</td>
                        <td>
                            <button
                                type="button"
                                class="riwayat-delete-btn"
                                aria-label="Hapus riwayat"
                            >
                                ×
                            </button>
                        </td>
                    </tr>

                </tbody>

            </table>
        </div>

    </div>

</div>

<script src="/KELOMPOK-5/assets/js/riwayat.js"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>