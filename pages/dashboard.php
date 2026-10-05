<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_login();
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<h1 class="h4 mb-3">Dashboard</h1>

<?php if ($_SESSION['role'] === 'owner'): ?>
  <p>Selamat datang, <?= htmlspecialchars($_SESSION['nama']) ?>. Ini dashboard owner.</p>
<?php elseif ($_SESSION['role'] === 'barber'): ?>
  <p>Selamat datang, <?= htmlspecialchars($_SESSION['nama']) ?>. Ini dashboard barber.</p>
<?php endif; ?>

<?php include __DIR__ . '/../includes/footer.php'; ?>