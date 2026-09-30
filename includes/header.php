<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kataji Barber</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="/kataji-barber/assets/css/style.css">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="/kataji-barber/pages/dashboard.php">Kataji Barber</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav me-auto">
        <?php if (($_SESSION['role'] ?? '') === 'owner'): ?>
          <!-- Menu khusus owner -->
          <li class="nav-item"><a class="nav-link" href="/kataji-barber/pages/layanan.php">Kelola Layanan</a></li>
          <li class="nav-item"><a class="nav-link" href="/kataji-barber/pages/rekap.php">Rekap Harian</a></li>
          <li class="nav-item"><a class="nav-link" href="/kataji-barber/pages/kinerja.php">Kinerja Barber</a></li>
        <?php elseif (($_SESSION['role'] ?? '') === 'barber'): ?>
          <!-- Menu khusus barber -->
          <li class="nav-item"><a class="nav-link" href="/kataji-barber/pages/transaksi.php">Catat Transaksi</a></li>
          <li class="nav-item"><a class="nav-link" href="/kataji-barber/pages/riwayat.php">Riwayat Saya</a></li>
        <?php endif; ?>
      </ul>
      <ul class="navbar-nav">
        <?php if (!empty($_SESSION['nama'])): ?>
          <li class="nav-item"><span class="nav-link text-light"><?= htmlspecialchars($_SESSION['nama']) ?></span></li>
          <li class="nav-item"><a class="nav-link" href="/kataji-barber/pages/logout.php">Keluar</a></li>
        <?php endif; ?>
      </ul>
    </div>
  </div>
</nav>
<main class="container py-4">
