<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$role = $_SESSION['role'] ?? '';
$nama = $_SESSION['nama'] ?? '';

$current_page = basename($_SERVER['PHP_SELF']);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kataji Barber</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <!-- Custom Style -->
    <link
        rel="stylesheet"
        href="/KELOMPOK-5/assets/css/style.css"
    >
</head>

<body>

<div class="app-layout">

    <!-- SIDEBAR -->
    <aside class="app-sidebar">

        <!-- LOGO & BRAND -->
        <div class="sidebar-logo">
            <a href="/KELOMPOK-5/pages/dashboard.php" class="sidebar-brand-link">
                <img
                    src="/KELOMPOK-5/assets/img/logo-kataji.png"
                    alt="Logo Kataji Barber"
                >
                <span class="sidebar-brand-text">KATAJI BARBER</span>
            </a>
        </div>

        <!-- MENU NAVIGASI (JOB 3.3: MENU BARBER TANPA KELOLA LAYANAN & LAPORAN; OWNER LENGKAP) -->
        <nav class="sidebar-menu">

            <!-- DASHBOARD -->
            <a
                href="/KELOMPOK-5/pages/dashboard.php"
                class="sidebar-link <?= $current_page === 'dashboard.php' ? 'active' : '' ?>"
            >
                <span>Dashboard</span>
            </a>

            <!-- KASIR -->
            <a
                href="/KELOMPOK-5/pages/transaksi.php"
                class="sidebar-link <?= $current_page === 'transaksi.php' ? 'active' : '' ?>"
            >
                <span>Kasir</span>
            </a>

            <!-- PELANGGAN -->
            <a
                href="/KELOMPOK-5/pages/pelanggan.php"
                class="sidebar-link <?= $current_page === 'pelanggan.php' ? 'active' : '' ?>"
            >
                <span>Pelanggan</span>
            </a>

            <!-- DATA BARBER -->
            <a
                href="/KELOMPOK-5/pages/barber.php"
                class="sidebar-link <?= $current_page === 'barber.php' ? 'active' : '' ?>"
            >
                <span>Data Barber</span>
            </a>

            <!-- LAYANAN & PRICELIST (KHUSUS OWNER SESUAI JOB 3.3) -->
            <?php if ($role === 'owner'): ?>
            <a
                href="/KELOMPOK-5/pages/layanan.php"
                class="sidebar-link <?= $current_page === 'layanan.php' ? 'active' : '' ?>"
            >
                <span>Layanan &amp; Pricelist</span>
            </a>
            <?php endif; ?>

            <!-- KONTEN WEB -->
            <a
                href="/KELOMPOK-5/pages/konten.php"
                class="sidebar-link <?= $current_page === 'konten.php' ? 'active' : '' ?>"
            >
                <span>Konten Web</span>
            </a>

            <!-- PENGELUARAN / HPP -->
            <a
                href="/KELOMPOK-5/pages/pengeluaran.php"
                class="sidebar-link <?= $current_page === 'pengeluaran.php' ? 'active' : '' ?>"
            >
                <span>Pengeluaran/HPP</span>
            </a>

            <!-- LAPORAN (KHUSUS OWNER SESUAI JOB 3.3) -->
            <?php if ($role === 'owner'): ?>
            <a
                href="/KELOMPOK-5/pages/laporan.php"
                class="sidebar-link <?= $current_page === 'laporan.php' ? 'active' : '' ?>"
            >
                <span>Laporan</span>
            </a>
            <?php endif; ?>

        </nav>

        <!-- TOMBOL KELUAR -->
        <div class="sidebar-bottom">
            <a
                href="/KELOMPOK-5/pages/logout.php"
                class="sidebar-logout"
            >
                Keluar
            </a>
        </div>

    </aside>

    <!-- AREA KONTEN UTAMA -->
    <div class="app-main">
        <main class="app-content">