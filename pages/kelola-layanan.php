<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_role(['owner']);
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<h1 class="h4 mb-3">Kelola Layanan</h1>
<p>Halaman ini khusus owner.</p>

<?php include __DIR__ . '/../includes/footer.php'; ?>