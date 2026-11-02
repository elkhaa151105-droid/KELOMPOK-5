<?php
/**
 * Pemeriksaan akses halaman.
 * Mengatur login, session timeout, dan pembatasan berdasarkan role.
 */

require_once __DIR__ . '/../config/config.php';

define('SESSION_LIFETIME', 1800);                   // 30 menit

function require_login(): void
{
    if (empty($_SESSION['id_user'])) {
        header('Location: /KELOMPOK-5/pages/login.php');
        exit;
    }

    // Sesi yang tidak memiliki waktu aktivitas valid harus login kembali.
    $lastActivity = $_SESSION['last_activity'] ?? null;
    if (
        !is_numeric($lastActivity) ||
        time() - (int) $lastActivity > SESSION_LIFETIME
    ) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();

        header('Location: /KELOMPOK-5/pages/login.php?expired=1');
        exit;
    }

    // Perbarui waktu aktivitas terakhir
    $_SESSION['last_activity'] = time();
}

function require_role(array $allowedRoles): void
{
    require_login();

    if (!in_array($_SESSION['role'] ?? '', $allowedRoles, true)) {
        http_response_code(403);
        exit('Anda tidak memiliki izin mengakses halaman ini.');
    }
}
