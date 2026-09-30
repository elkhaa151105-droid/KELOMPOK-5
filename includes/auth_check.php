<?php
/**
 * Kerangka pemeriksaan akses per halaman.
 * Menopang story: "Pembatasan hak akses sesuai peran (barber vs owner)".
 *
 * Cara pakai: require file ini di baris paling atas tiap halaman yang perlu dibatasi,
 * lalu panggil require_role() dengan peran yang diizinkan.
 *
 * Isi validasi kredensial (proses login) sendiri sesuai acceptance criteria story
 * "Login barber" dan "Login owner" di Trello — file ini baru kerangka pengecekan sesi.
 */

require_once __DIR__ . '/../config/config.php';

function require_login(): void {
    if (empty($_SESSION['id_user'])) {
        header('Location: /kataji-barber/pages/login.php');
        exit;
    }
}

function require_role(array $allowedRoles): void {
    require_login();
    if (!in_array($_SESSION['role'] ?? '', $allowedRoles, true)) {
        http_response_code(403);
        // TODO: arahkan ke halaman "Anda tidak memiliki izin mengakses halaman ini"
        // sesuai AC story "Pembatasan hak akses" — belum diimplementasikan di kerangka ini.
        exit('Anda tidak memiliki izin mengakses halaman ini.');
    }
}
