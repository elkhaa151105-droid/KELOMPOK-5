<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Kataji Barber</title>

    <!-- Bootstrap -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <!-- CSS -->
    <link
        rel="stylesheet"
        href="/KELOMPOK-5/assets/css/style.css"
    >
</head>

<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">

        <!-- Brand -->
        <a
            class="navbar-brand"
            href="/KELOMPOK-5/pages/dashboard.php"
        >
            Kataji Barber
        </a>

        <!-- Toggle Mobile -->
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
        >
            <span class="navbar-toggler-icon"></span>
        </button>

        <div
            class="collapse navbar-collapse"
            id="navMenu"
        >

            <!-- Menu berdasarkan role -->
            <ul class="navbar-nav me-auto">

                <?php if (($_SESSION['role'] ?? '') === 'owner'): ?>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            href="/KELOMPOK-5/pages/layanan.php"
                        >
                            Kelola Layanan
                        </a>
                    </li>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            href="/KELOMPOK-5/pages/rekap.php"
                        >
                            Rekap Harian
                        </a>
                    </li>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            href="/KELOMPOK-5/pages/kinerja.php"
                        >
                            Kinerja Barber
                        </a>
                    </li>

                <?php elseif (($_SESSION['role'] ?? '') === 'barber'): ?>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            href="/KELOMPOK-5/pages/transaksi.php"
                        >
                            Catat Transaksi
                        </a>
                    </li>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            href="/KELOMPOK-5/pages/riwayat.php"
                        >
                            Riwayat Saya
                        </a>
                    </li>

                <?php endif; ?>

            </ul>

            <!-- Informasi user -->
            <ul class="navbar-nav">

                <?php if (!empty($_SESSION['nama'])): ?>

                    <li class="nav-item">
                        <span class="nav-link text-light">
                            <?= htmlspecialchars($_SESSION['nama']) ?>
                        </span>
                    </li>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            href="/KELOMPOK-5/pages/logout.php"
                        >
                            Keluar
                        </a>
                    </li>

                <?php endif; ?>

            </ul>

        </div>
    </div>
</nav>

<main class="container py-4">