<?php
require_once __DIR__ . '/../config/config.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    header('Location: /KELOMPOK-5/pages/login.php?error=1');
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND aktif = 1');
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    header('Location: /KELOMPOK-5/pages/login.php?error=1');
    exit;
}

$_SESSION['id_user'] = $user['id_user'];
$_SESSION['nama'] = $user['nama'];
$_SESSION['role'] = $user['role'];
$_SESSION['login_time'] = time();
$_SESSION['last_activity'] = time();

$_SESSION['login_notification'] = $user['role'] === 'owner'
    ? 'Ini halaman owner'
    : 'Ini halaman barber';

if ($user['role'] === 'owner') {
    header('Location: /KELOMPOK-5/pages/dashboard.php');
} else {
    header('Location: /KELOMPOK-5/pages/transaksi.php');
}

exit;