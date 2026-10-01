<?php
require_once __DIR__ . '/../config/config.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    header('Location: /kataji-barber/pages/login.php?error=1');
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND aktif = 1');
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    header('Location: /kataji-barber/pages/login.php?error=1');
    exit;
}

$_SESSION['id_user'] = $user['id_user'];
$_SESSION['nama'] = $user['nama'];
$_SESSION['role'] = $user['role'];
$_SESSION['login_time'] = time();
$_SESSION['last_activity'] = time();

header('Location: /kataji-barber/pages/dashboard.php');
exit;