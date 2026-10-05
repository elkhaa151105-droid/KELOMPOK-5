<?php

require_once __DIR__ . '/../config/config.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Username atau password kosong
if ($username === '' || $password === '') {
    header('Location: /KELOMPOK-5/pages/login.php?error=empty');
    exit;
}

// Cari user aktif
$stmt = $pdo->prepare(
    'SELECT * FROM users WHERE username = ? AND aktif = 1'
);

$stmt->execute([$username]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Username atau password salah
if (!$user || !password_verify($password, $user['password_hash'])) {
    header('Location: /KELOMPOK-5/pages/login.php?error=invalid');
    exit;
}

// Simpan session
$_SESSION['id_user'] = $user['id_user'];
$_SESSION['nama'] = $user['nama'];
$_SESSION['role'] = $user['role'];
$_SESSION['login_time'] = time();
$_SESSION['last_activity'] = time();

// Owner masuk dashboard
if ($user['role'] === 'owner') {
    header('Location: /KELOMPOK-5/pages/dashboard.php');
    exit;
}

// Role lainnya
header('Location: /KELOMPOK-5/pages/dashboard.php');
exit;