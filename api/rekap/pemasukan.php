
<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

apiWajibLogin();

$role = strtolower(trim($_SESSION['role'] ?? ''));

function kirimJsonRekap(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($role !== 'owner') {
    kirimJsonRekap(403, [
        'success' => false,
        'message' => 'Hanya owner yang dapat melihat rekap pemasukan.',
        'error_code' => 'FORBIDDEN'
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');

    kirimJsonRekap(405, [
        'success' => false,
        'message' => 'Method tidak didukung.',
        'error_code' => 'METHOD_NOT_ALLOWED'
    ]);
}

try {
    // Default tanggal menggunakan zona waktu WIB.
    $zonaWIB = new DateTimeZone('Asia/Jakarta');
    $hariIniWIB = (new DateTimeImmutable('now', $zonaWIB))
        ->format('Y-m-d');

    $tanggal = $_GET['tanggal'] ?? $hariIniWIB;

    // Validasi tanggal YYYY-MM-DD secara ketat.
    $tanggalObj = DateTimeImmutable::createFromFormat(
        '!Y-m-d',
        $tanggal,
        $zonaWIB
    );

    $errorTanggal = DateTimeImmutable::getLastErrors();

    if (
        !is_string($tanggal) ||
        !$tanggalObj ||
        ($errorTanggal !== false &&
            ($errorTanggal['warning_count'] > 0 ||
             $errorTanggal['error_count'] > 0)) ||
        $tanggalObj->format('Y-m-d') !== $tanggal
    ) {
        kirimJsonRekap(422, [
            'success' => false,
            'message' => 'Format tanggal harus YYYY-MM-DD.',
            'error_code' => 'VALIDATION_ERROR'
        ]);
    }

    // Total pemasukan seluruh transaksi pada tanggal pilihan.
    $stmtTotal = $pdo->prepare(
    'SELECT COALESCE(SUM(total_harga), 0)
     FROM transaksi
     WHERE tanggal = :tanggal
       AND dihapus_pada IS NULL'
);

    $stmtTotal->execute([':tanggal' => $tanggal]);
    $totalPemasukan = (int) $stmtTotal->fetchColumn();

    // Rincian pemasukan per barber pada tanggal yang sama.
    $stmtBarber = $pdo->prepare(
    'SELECT
        t.id_barber,
        u.nama AS nama_barber,
        COUNT(t.id_transaksi) AS jumlah_transaksi,
        COALESCE(SUM(t.total_harga), 0) AS total_pemasukan
     FROM transaksi t
     INNER JOIN users u ON u.id_user = t.id_barber
     WHERE t.tanggal = :tanggal
       AND t.dihapus_pada IS NULL
     GROUP BY t.id_barber, u.nama
     ORDER BY u.nama ASC'
);


    $stmtBarber->execute([':tanggal' => $tanggal]);
    $rincianBarber = $stmtBarber->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rincianBarber as &$barber) {
        $barber['id_barber'] = (int) $barber['id_barber'];
        $barber['jumlah_transaksi'] = (int) $barber['jumlah_transaksi'];
        $barber['total_pemasukan'] = (int) $barber['total_pemasukan'];
    }
    unset($barber);

    kirimJsonRekap(200, [
        'success' => true,
        'data' => [
            'tanggal' => $tanggal,
            'total_pemasukan' => $totalPemasukan,
            'rincian_per_barber' => $rincianBarber
        ]
    ]);
} catch (Throwable $e) {
    error_log('API rekap pemasukan: ' . $e->getMessage());

    kirimJsonRekap(500, [
        'success' => false,
        'message' => 'Terjadi kesalahan pada server.',
        'error_code' => 'INTERNAL_SERVER_ERROR'
    ]);
}
