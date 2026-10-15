
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

if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    header('Allow: GET, POST, PUT, PATCH, DELETE');

    kirimJson(405, [
        'success' => false,
        'message' => 'Method HTTP tidak diizinkan.',
        'error_code' => 'METHOD_NOT_ALLOWED'
    ]);
}

try {
    require_once __DIR__ . '/../../config/config.php';
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    require_once __DIR__ . '/../middleware/auth.php';
    apiWajibOwner();
}

    // GET: mengambil daftar layanan aktif
    if ($method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT id_layanan, nama_layanan, harga, hpp
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

        $namaRaw = $data['nama_layanan'] ?? null;
        if (!is_string($namaRaw)) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Nama layanan wajib berupa teks.',
                'error_code' => 'INVALID_NAMA_LAYANAN'
            ]);
        }
        $nama = trim($namaRaw);
        $harga = filter_var(
            $data['harga'] ?? null,
            FILTER_VALIDATE_INT
        );
        $hpp = filter_var(
            $data['hpp'] ?? null,
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

        if ($hpp === false || $hpp === null || $hpp < 0 || $hpp > 2147483647) {
            kirimJson(422, [
                'success' => false,
                'message' => 'HPP harus berupa bilangan bulat nol atau lebih.',
                'error_code' => 'INVALID_HPP'
            ]);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO layanan (nama_layanan, harga, hpp, aktif)
             VALUES (?, ?, ?, 1)'
        );

        $stmt->execute([$nama, $harga, $hpp]);

        kirimJson(201, [
            'success' => true,
            'message' => 'Layanan berhasil ditambahkan.',
            'data' => [
                'id_layanan' => (int) $pdo->lastInsertId(),
                'nama_layanan' => $nama,
                'harga' => $harga,
                'hpp' => $hpp
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
        $namaRaw = $data['nama_layanan'] ?? null;
        if (!is_string($namaRaw)) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Nama layanan wajib berupa teks.',
                'error_code' => 'INVALID_NAMA_LAYANAN'
            ]);
        }
        $nama = trim($namaRaw);
        $harga = filter_var(
            $data['harga'] ?? null,
            FILTER_VALIDATE_INT
        );
        $hpp = filter_var(
            $data['hpp'] ?? null,
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

        if ($hpp === false || $hpp === null || $hpp < 0 || $hpp > 2147483647) {
            kirimJson(422, [
                'success' => false,
                'message' => 'HPP harus berupa bilangan bulat nol atau lebih.',
                'error_code' => 'INVALID_HPP'
            ]);
        }

        $stmt = $pdo->prepare(
            'UPDATE layanan
             SET nama_layanan = ?, harga = ?, hpp = ?
             WHERE id_layanan = ? AND aktif = 1'
        );

        $stmt->execute([$nama, $harga, $hpp, $id]);

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

    // PATCH: mengubah status layanan; tanpa nilai aktif tetap menonaktifkan
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

        $aktif = array_key_exists('aktif', $data)
            ? filter_var($data['aktif'], FILTER_VALIDATE_INT)
            : 0;
        if (!in_array($aktif, [0, 1], true)) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Status aktif harus bernilai 0 atau 1.',
                'error_code' => 'INVALID_STATUS'
            ]);
        }

        $stmt = $pdo->prepare(
            'UPDATE layanan
             SET aktif = ?
             WHERE id_layanan = ?'
        );

        $stmt->execute([$aktif, $id]);

        if ($stmt->rowCount() === 0) {
            $cek = $pdo->prepare(
                'SELECT id_layanan FROM layanan WHERE id_layanan = ?'
            );
            $cek->execute([$id]);
            if (!$cek->fetch()) {
            kirimJson(404, [
                'success' => false,
                'message' => 'Layanan tidak ditemukan.',
                'error_code' => 'LAYANAN_NOT_FOUND'
            ]);
            }
        }

        kirimJson(200, [
            'success' => true,
            'message' => $aktif === 1
                ? 'Layanan berhasil diaktifkan.'
                : 'Layanan berhasil dinonaktifkan.'
        ]);
    }

    if ($method === 'DELETE') {
        $data = bacaJson();
        $id = filter_var(
            $data['id_layanan'] ?? null,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );
        if ($id === false) {
            kirimJson(422, [
                'success' => false,
                'message' => 'ID layanan tidak valid.',
                'error_code' => 'INVALID_ID'
            ]);
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'SELECT id_layanan FROM layanan WHERE id_layanan = ? FOR UPDATE'
        );
        $stmt->execute([$id]);
        if (!$stmt->fetchColumn()) {
            $pdo->rollBack();
            kirimJson(404, [
                'success' => false,
                'message' => 'Layanan tidak ditemukan.',
                'error_code' => 'LAYANAN_NOT_FOUND'
            ]);
        }

        $stmt = $pdo->prepare(
            'SELECT 1 FROM detail_transaksi WHERE id_layanan = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        if ($stmt->fetchColumn()) {
            $pdo->rollBack();
            kirimJson(409, [
                'success' => false,
                'message' => 'Layanan yang tercatat pada transaksi tidak dapat dihapus.',
                'error_code' => 'LAYANAN_IN_USE'
            ]);
        }

        $stmt = $pdo->prepare('DELETE FROM layanan WHERE id_layanan = ?');
        $stmt->execute([$id]);
        $pdo->commit();

        kirimJson(200, [
            'success' => true,
            'message' => 'Layanan berhasil dihapus.'
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
