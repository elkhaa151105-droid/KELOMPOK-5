<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner']);

// Hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /KELOMPOK-5/pages/layanan.php');
    exit;
}

$action = $_POST['action'] ?? '';


// =====================================================
// TAMBAH LAYANAN
// =====================================================

if ($action === 'tambah') {

    $nama_layanan = trim($_POST['nama_layanan'] ?? '');
    $harga_input = trim($_POST['harga'] ?? '');

    // Nama layanan wajib diisi
    if ($nama_layanan === '') {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=nama_kosong');
        exit;
    }

    // Harga wajib diisi
    if ($harga_input === '') {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=harga_invalid');
        exit;
    }

    $harga = filter_var($harga_input, FILTER_VALIDATE_INT);

    // AC3: harga harus berupa angka dan > 0
    if ($harga === false || $harga <= 0) {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=harga_invalid');
        exit;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO layanan (nama_layanan, harga, aktif)
         VALUES (?, ?, 1)'
    );

    $stmt->execute([
        $nama_layanan,
        $harga
    ]);

    header('Location: /KELOMPOK-5/pages/layanan.php?status=tambah_sukses');
    exit;
}


// =====================================================
// UBAH LAYANAN
// =====================================================

if ($action === 'ubah') {

    $id_layanan = filter_var(
        $_POST['id_layanan'] ?? null,
        FILTER_VALIDATE_INT
    );

    $nama_layanan = trim($_POST['nama_layanan'] ?? '');
    $harga_input = trim($_POST['harga'] ?? '');

    if ($id_layanan === false || $id_layanan <= 0) {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=gagal');
        exit;
    }

    if ($nama_layanan === '') {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=nama_kosong');
        exit;
    }

    if ($harga_input === '') {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=harga_invalid');
        exit;
    }

    $harga = filter_var($harga_input, FILTER_VALIDATE_INT);

    // AC3
    if ($harga === false || $harga <= 0) {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=harga_invalid');
        exit;
    }

    // Hanya update layanan yang masih aktif
    $stmt = $pdo->prepare(
        'UPDATE layanan
         SET nama_layanan = ?, harga = ?
         WHERE id_layanan = ? AND aktif = 1'
    );

    $stmt->execute([
        $nama_layanan,
        $harga,
        $id_layanan
    ]);

    header('Location: /KELOMPOK-5/pages/layanan.php?status=ubah_sukses');
    exit;
}


// =====================================================
// NONAKTIFKAN LAYANAN
// =====================================================

if ($action === 'nonaktifkan') {

    $id_layanan = filter_var(
        $_POST['id_layanan'] ?? null,
        FILTER_VALIDATE_INT
    );

    if ($id_layanan === false || $id_layanan <= 0) {
        header('Location: /KELOMPOK-5/pages/layanan.php?status=gagal');
        exit;
    }

    // Tidak menghapus record.
    // Hanya mengubah status menjadi tidak aktif.
    $stmt = $pdo->prepare(
        'UPDATE layanan
         SET aktif = 0
         WHERE id_layanan = ? AND aktif = 1'
    );

    $stmt->execute([
        $id_layanan
    ]);

    header('Location: /KELOMPOK-5/pages/layanan.php?status=nonaktif_sukses');
    exit;
}


// Action tidak dikenal
header('Location: /KELOMPOK-5/pages/layanan.php?status=gagal');
exit;