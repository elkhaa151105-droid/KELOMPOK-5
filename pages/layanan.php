<?php

require_once __DIR__ . '/../includes/auth_check.php';

// Proteksi server-side: Hanya Owner yang diizinkan (Job 3.3)
require_role(['owner']);

$role = $_SESSION['role'] ?? '';
$nama = $_SESSION['nama'] ?? '';
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="dashboard-page">
    <div class="dashboard-heading">
        <h1>Layanan &amp; Pricelist</h1>
        <p>Kelola daftar layanan dan harga Kataji Barber.</p>
    </div>

    <div class="dashboard-section" style="padding: 24px; background: #FFFFFF; border-radius: 14px; border: 1px solid #E2E4F0;">
        <p style="margin: 0; color: #2E9E5B; font-weight: 600;">
            
        </p>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
