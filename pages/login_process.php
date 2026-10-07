<?php

require_once __DIR__ . '/../config/config.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Username dan password sama-sama kosong
if ($username === '' && $password === '') {
    header('Location: /KELOMPOK-5/pages/login.php?both_empty=1');
    exit;
}

// Username kosong
if ($username === '') {
    header('Location: /KELOMPOK-5/pages/login.php?username_empty=1');
    exit;
}

// Password kosong
if ($password === '') {
    header('Location: /KELOMPOK-5/pages/login.php?password_empty=1');
    exit;
}

// Cari user yang aktif
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND aktif = 1');
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Username atau password salah
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

// Redirect sesuai role
if ($user['role'] === 'barber') {
    header('Location: /KELOMPOK-5/pages/catat-transaksi.php');
    exit;
}

header('Location: /KELOMPOK-5/pages/dashboard.php');
exit;