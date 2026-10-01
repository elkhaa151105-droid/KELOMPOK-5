<?php

require_once __DIR__ . '/../config/config.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Validasi input kosong
if ($username === '' || $password === '') {
    header('Location: /KELOMPOK-5/pages/login.php?error=1');
    exit;
}

// Cari user yang aktif
$stmt = $pdo->prepare(
    'SELECT * FROM users WHERE username = ? AND aktif = 1'
);

$stmt->execute([$username]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Verifikasi user dan password
if (!$user || !password_verify($password, $user['password_hash'])) {
    header('Location: /KELOMPOK-5/pages/login.php?error=1');
    exit;
}

// Simpan informasi user ke session
$_SESSION['id_user'] = $user['id_user'];
$_SESSION['nama'] = $user['nama'];
$_SESSION['role'] = $user['role'];
$_SESSION['login_time'] = time();
$_SESSION['last_activity'] = time();

// Login berhasil
header('Location: /KELOMPOK-5/pages/dashboard.php');
exit;