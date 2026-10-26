<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

apiWajibOwner();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Gunakan metode POST.'
    ]);
    exit;
}



$id = filter_input(INPUT_POST, 'id_transaksi', FILTER_VALIDATE_INT);

if (!$id || $id < 1) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID transaksi tidak valid.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'UPDATE transaksi
         SET dihapus_pada = NOW()
         WHERE id_transaksi = :id
           AND dihapus_pada IS NULL'
    );

    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Transaksi tidak ditemukan atau sudah dihapus.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Riwayat transaksi berhasil dihapus.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menghapus riwayat transaksi.'
    ]);
}