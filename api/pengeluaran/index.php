
<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

apiWajibOwner();

$method = $_SERVER['REQUEST_METHOD'];
$idUser = (int) ($_SESSION['id_user'] ?? 0);

function kirimJsonPengeluaran(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function tanggalValidPengeluaran($tanggal): bool
{
    if (!is_string($tanggal)) {
        return false;
    }

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $tanggal);

    return $date !== false && $date->format('Y-m-d') === $tanggal;
}

function tanggalHariIniWIBPengeluaran(): string
{
    return (new DateTimeImmutable(
        'now',
        new DateTimeZone('Asia/Jakarta')
    ))->format('Y-m-d');
}

try {
    // GET: daftar dan total pengeluaran per tanggal.
    if ($method === 'GET') {
        $tanggal = $_GET['tanggal'] ?? tanggalHariIniWIBPengeluaran();
        if (!tanggalValidPengeluaran($tanggal)) {
            kirimJsonPengeluaran(422, [
                'success' => false,
                'message' => 'Format tanggal harus YYYY-MM-DD.',
                'error_code' => 'VALIDATION_ERROR'
            ]);
        }

        $stmt = $pdo->prepare(
            'SELECT id_pengeluaran, kategori, nominal, tanggal,
                    keterangan, dibuat_pada
             FROM pengeluaran
             WHERE tanggal = :tanggal
             ORDER BY id_pengeluaran DESC'
        );

        $stmt->execute(['tanggal' => $tanggal]);
        $daftar = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmtTotal = $pdo->prepare(
            'SELECT COALESCE(SUM(nominal), 0)
             FROM pengeluaran
             WHERE tanggal = :tanggal'
        );

        $stmtTotal->execute(['tanggal' => $tanggal]);

        kirimJsonPengeluaran(200, [
            'success' => true,
            'data' => [
                'tanggal' => $tanggal,
                'pengeluaran' => $daftar,
                'total_pengeluaran' => (int) $stmtTotal->fetchColumn()
            ]
        ]);
    }

    // POST: simpan pengeluaran baru.
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            kirimJsonPengeluaran(400, [
                'success' => false,
                'message' => 'Body harus berupa JSON yang valid.',
                'error_code' => 'INVALID_JSON'
            ]);
        }

        $kategori = trim(
            is_string($input['kategori'] ?? null)
                ? $input['kategori']
                : ''
        );

        $nominalInput = $input['nominal'] ?? null;
        $tanggal = $input['tanggal'] ?? tanggalHariIniWIBPengeluaran();
        $keterangan = $input['keterangan'] ?? null;

        // Tolak nominal kosong, bukan angka, nol, negatif,
        // desimal, dan angka di luar batas integer database.
        $nominalValid = (
            (is_int($nominalInput) ||
                (is_string($nominalInput) &&
                 preg_match('/^[0-9]+$/', $nominalInput)))
            && (float) $nominalInput > 0
            && (float) $nominalInput <= 2147483647
        );

        if (!$nominalValid) {
            kirimJsonPengeluaran(422, [
                'success' => false,
                'message' => 'Nominal harus lebih dari nol',
                'error_code' => 'VALIDATION_ERROR'
            ]);
        }

        $nominal = (int) $nominalInput;

        if ($kategori === '' || mb_strlen($kategori) > 100) {
            kirimJsonPengeluaran(422, [
                'success' => false,
                'message' => 'Kategori wajib diisi (maksimal 100 karakter).',
                'error_code' => 'VALIDATION_ERROR'
            ]);
        }

        if (!tanggalValidPengeluaran($tanggal)) {
            kirimJsonPengeluaran(422, [
                'success' => false,
                'message' => 'Format tanggal harus YYYY-MM-DD.',
                'error_code' => 'VALIDATION_ERROR'
            ]);
        }

        if ($keterangan !== null && !is_string($keterangan)) {
            kirimJsonPengeluaran(422, [
                'success' => false,
                'message' => 'Keterangan harus berupa teks.',
                'error_code' => 'VALIDATION_ERROR'
            ]);
        }

        $keterangan = $keterangan !== null ? trim($keterangan) : null;

        if ($keterangan === '') {
            $keterangan = null;
        }

        if ($keterangan !== null && mb_strlen($keterangan) > 255) {
            kirimJsonPengeluaran(422, [
                'success' => false,
                'message' => 'Keterangan maksimal 255 karakter.',
                'error_code' => 'VALIDATION_ERROR'
            ]);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO pengeluaran
                (id_user, tanggal, kategori, nominal, keterangan)
             VALUES
                (:id_user, :tanggal, :kategori, :nominal, :keterangan)'
        );

        $stmt->execute([
            'id_user' => $idUser,
            'tanggal' => $tanggal,
            'kategori' => $kategori,
            'nominal' => $nominal,
            'keterangan' => $keterangan
        ]);

        kirimJsonPengeluaran(201, [
            'success' => true,
            'message' => 'Pengeluaran berhasil dicatat.',
            'data' => [
                'id_pengeluaran' => (int) $pdo->lastInsertId(),
                'id_user' => $idUser,
                'tanggal' => $tanggal,
                'kategori' => $kategori,
                'nominal' => $nominal,
                'keterangan' => $keterangan
            ]
        ]);
    }

    header('Allow: GET, POST');

    kirimJsonPengeluaran(405, [
        'success' => false,
        'message' => 'Method tidak didukung.',
        'error_code' => 'METHOD_NOT_ALLOWED'
    ]);

} catch (Throwable $e) {
    error_log('API pengeluaran: ' . $e->getMessage());

    kirimJsonPengeluaran(500, [
        'success' => false,
        'message' => 'Terjadi kesalahan pada server.',
        'error_code' => 'INTERNAL_SERVER_ERROR'
    ]);
}
