<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner']);
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="dashboard-page">
    <div class="dashboard-heading">
        <h1>Laporan</h1>
        <p>Ringkasan laporan Kataji Barber.</p>
    </div>
    <section class="dashboard-section rekap-card" role="status">
        <p>Data laporan belum tersedia pada backend.</p>
    </section>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
