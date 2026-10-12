
<?php

header('Content-Type: application/json; charset=utf-8');

function kirimJson(int $status, array $body): void
{
    http_response_code($status);

    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function bacaJson(): array
{
    $isi = file_get_contents('php://input');
    $data = json_decode($isi, true);

    if (!is_array($data)) {
        kirimJson(400, [
            'success' => false,
            'message' => 'Body harus berupa JSON yang valid.',
            'error_code' => 'INVALID_JSON'
        ]);
    }

    return $data;
}

$method = $_SERVER['REQUEST_METHOD'];

if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH'], true)) {
    header('Allow: GET, POST, PUT, PATCH');

    kirimJson(405, [
        'success' => false,
        'message' => 'Method HTTP tidak diizinkan.',
        'error_code' => 'METHOD_NOT_ALLOWED'
    ]);
}

try {
    require_once __DIR__ . '/../../config/config.php';
    if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    require_once __DIR__ . '/../middleware/auth.php';
    apiWajibOwner();
}

    // GET: mengambil daftar layanan aktif
    if ($method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT id_layanan, nama_layanan, harga
             FROM layanan
             WHERE aktif = 1
             ORDER BY id_layanan DESC'
        );

        $stmt->execute();

        kirimJson(200, [
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // POST: menambahkan layanan baru
    if ($method === 'POST') {
        $data = bacaJson();

        $nama = trim($data['nama_layanan'] ?? '');
        $harga = filter_var(
            $data['harga'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($nama === '' || strlen($nama) > 100) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Nama layanan wajib diisi dan maksimal 100 karakter.',
                'error_code' => 'INVALID_NAMA_LAYANAN'
            ]);
        }

        if ($harga === false || $harga === null || $harga <= 0) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Harga harus berupa bilangan bulat lebih dari nol.',
                'error_code' => 'INVALID_HARGA'
            ]);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO layanan (nama_layanan, harga, aktif)
             VALUES (?, ?, 1)'
        );

        $stmt->execute([$nama, $harga]);

        kirimJson(201, [
            'success' => true,
            'message' => 'Layanan berhasil ditambahkan.',
            'data' => [
                'id_layanan' => (int) $pdo->lastInsertId(),
                'nama_layanan' => $nama,
                'harga' => $harga
            ]
        ]);
    }

    // PUT: mengubah nama dan harga layanan
    if ($method === 'PUT') {
        $data = bacaJson();

        $id = filter_var(
            $data['id_layanan'] ?? null,
            FILTER_VALIDATE_INT
        );
        $nama = trim($data['nama_layanan'] ?? '');
        $harga = filter_var(
            $data['harga'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($id === false || $id === null || $id <= 0) {
            kirimJson(422, [
                'success' => false,
                'message' => 'ID layanan tidak valid.',
                'error_code' => 'INVALID_ID'
            ]);
        }

        if ($nama === '' || strlen($nama) > 100) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Nama layanan wajib diisi dan maksimal 100 karakter.',
                'error_code' => 'INVALID_NAMA_LAYANAN'
            ]);
        }

        if ($harga === false || $harga === null || $harga <= 0) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Harga harus berupa bilangan bulat lebih dari nol.',
                'error_code' => 'INVALID_HARGA'
            ]);
        }

        $stmt = $pdo->prepare(
            'UPDATE layanan
             SET nama_layanan = ?, harga = ?
             WHERE id_layanan = ? AND aktif = 1'
        );

        $stmt->execute([$nama, $harga, $id]);

        if ($stmt->rowCount() === 0) {
            $cek = $pdo->prepare(
                'SELECT id_layanan FROM layanan
                 WHERE id_layanan = ? AND aktif = 1'
            );
            $cek->execute([$id]);

            if (!$cek->fetch()) {
                kirimJson(404, [
                    'success' => false,
                    'message' => 'Layanan tidak ditemukan atau sudah nonaktif.',
                    'error_code' => 'LAYANAN_NOT_FOUND'
                ]);
            }
        }

        kirimJson(200, [
            'success' => true,
            'message' => 'Layanan berhasil diperbarui.'
        ]);
    }

    // PATCH: menonaktifkan layanan
    if ($method === 'PATCH') {
        $data = bacaJson();

        $id = filter_var(
            $data['id_layanan'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($id === false || $id === null || $id <= 0) {
            kirimJson(422, [
                'success' => false,
                'message' => 'ID layanan tidak valid.',
                'error_code' => 'INVALID_ID'
            ]);
        }

        $stmt = $pdo->prepare(
            'UPDATE layanan
             SET aktif = 0
             WHERE id_layanan = ? AND aktif = 1'
        );

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            kirimJson(404, [
                'success' => false,
                'message' => 'Layanan tidak ditemukan atau sudah nonaktif.',
                'error_code' => 'LAYANAN_NOT_FOUND'
            ]);
        }

        kirimJson(200, [
            'success' => true,
            'message' => 'Layanan berhasil dinonaktifkan.'
        ]);
    }

} catch (Throwable $e) {
    error_log($e->getMessage());

    kirimJson(500, [
        'success' => false,
        'message' => 'Terjadi kesalahan pada server.',
        'error_code' => 'INTERNAL_ERROR'
    ]);
}
