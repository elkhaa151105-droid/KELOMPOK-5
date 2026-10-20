<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

apiWajibLogin();

$role = strtolower(trim($_SESSION['role'] ?? ''));

function kirimJsonPelanggan(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if (!in_array($role, ['owner', 'barber'], true)) {
        kirimJsonPelanggan(403, [
            'success' => false,
            'message' => 'Role tidak diizinkan.'
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Allow: GET');

        kirimJsonPelanggan(405, [
            'success' => false,
            'message' => 'Metode tidak diizinkan.'
        ]);
    }

    $q = trim((string) ($_GET['q'] ?? ''));

    if (strlen($q) < 2) {
        kirimJsonPelanggan(200, [
            'success' => true,
            'data' => []
        ]);
    }

    $stmt = $pdo->prepare(
        'SELECT id_pelanggan, nama, no_hp
         FROM pelanggan
         WHERE nama LIKE :q
         ORDER BY nama ASC, id_pelanggan ASC
         LIMIT 10'
    );

    $stmt->execute([
        ':q' => '%' . $q . '%'
    ]);

    kirimJsonPelanggan(200, [
        'success' => true,
        'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (Throwable $e) {
    error_log('API pelanggan: ' . $e->getMessage());

    kirimJsonPelanggan(500, [
        'success' => false,
        'message' => 'Gagal mencari pelanggan.'
    ]);
}