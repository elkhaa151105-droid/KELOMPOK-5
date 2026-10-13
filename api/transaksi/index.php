
<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

apiWajibLogin();

$method = $_SERVER['REQUEST_METHOD'];
$role = strtolower(trim($_SESSION['role'] ?? ''));
$idUser = (int) ($_SESSION['id_user'] ?? 0);

function kirimJson(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // =========================
    // GET: DAFTAR TRANSAKSI
    // =========================
    if ($method === 'GET') {
        if (!in_array($role, ['owner', 'barber'], true)) {
            kirimJson(403, [
                'success' => false,
                'message' => 'Role tidak diizinkan.',
                'error_code' => 'FORBIDDEN'
            ]);
        }

        $sql = "
            SELECT
                t.id_transaksi,
                t.id_pencatat,
                t.id_barber,
                u.nama AS nama_barber,
                t.id_pelanggan,
                p.nama AS nama_pelanggan,
                p.no_hp,
                t.tanggal,
                t.waktu,
                t.total_harga,
                t.dibuat_pada
            FROM transaksi t
            JOIN users u ON u.id_user = t.id_barber
            LEFT JOIN pelanggan p ON p.id_pelanggan = t.id_pelanggan
        ";

        // Barber hanya melihat transaksi miliknya.
        // Owner dapat melihat semua transaksi.
        if ($role === 'barber') {
            $sql .= " WHERE t.id_barber = :id_user";
        }

        $sql .= "
            ORDER BY
                t.tanggal DESC,
                t.waktu DESC,
                t.id_transaksi DESC
        ";

        $stmt = $pdo->prepare($sql);

        if ($role === 'barber') {
            $stmt->bindValue(':id_user', $idUser, PDO::PARAM_INT);
        }

        $stmt->execute();

        kirimJson(200, [
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    // =========================
    // POST: TAMBAH TRANSAKSI
    // =========================
    if ($method === 'POST') {
        if (!in_array($role, ['owner', 'barber'], true)) {
            kirimJson(403, [
                'success' => false,
                'message' => 'Role tidak diizinkan mencatat transaksi.',
                'error_code' => 'FORBIDDEN'
            ]);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            kirimJson(400, [
                'success' => false,
                'message' => 'Body harus berupa JSON yang valid.'
            ]);
        }

        $namaPelanggan = trim($input['nama_pelanggan'] ?? '');
        $noHp = trim($input['no_hp'] ?? '');
        $layananInput = $input['layanan'] ?? [];

        // Tentukan barber yang melayani.
        if ($role === 'barber') {
            $idBarber = $idUser;
        } else {
            $idBarber = filter_var(
                $input['id_barber'] ?? null,
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1]]
            );

            if ($idBarber === false) {
                kirimJson(422, [
                    'success' => false,
                    'message' => 'Owner wajib memilih barber yang melayani.'
                ]);
            }

            $stmtBarber = $pdo->prepare(
                "SELECT id_user
                 FROM users
                 WHERE id_user = :id_user
                   AND role = 'barber'
                   AND aktif = 1"
            );

            $stmtBarber->execute([':id_user' => $idBarber]);

            if (!$stmtBarber->fetchColumn()) {
                kirimJson(422, [
                    'success' => false,
                    'message' => 'Barber tidak ditemukan atau tidak aktif.'
                ]);
            }
        }

        if (!is_array($layananInput) || count($layananInput) === 0) {
            kirimJson(400, [
                'success' => false,
                'message' => 'Pilih minimal satu layanan.'
            ]);
        }

        // Validasi layanan dan jumlah.
        $jumlahPerLayanan = [];

        foreach ($layananInput as $item) {
            if (!is_array($item)) {
                kirimJson(400, [
                    'success' => false,
                    'message' => 'Format layanan tidak valid.'
                ]);
            }

            $idLayanan = filter_var(
                $item['id_layanan'] ?? null,
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1]]
            );

            $jumlah = filter_var(
                $item['jumlah'] ?? 1,
                FILTER_VALIDATE_INT,
                ['options' => [
                    'min_range' => 1,
                    'max_range' => 100
                ]]
            );

            if ($idLayanan === false || $jumlah === false) {
                kirimJson(400, [
                    'success' => false,
                    'message' => 'ID layanan atau jumlah tidak valid.'
                ]);
            }

            $jumlahPerLayanan[$idLayanan] =
                ($jumlahPerLayanan[$idLayanan] ?? 0) + $jumlah;

            if ($jumlahPerLayanan[$idLayanan] > 100) {
                kirimJson(400, [
                    'success' => false,
                    'message' => 'Jumlah layanan tidak boleh lebih dari 100.'
                ]);
            }
        }

        $pdo->beginTransaction();

        // Simpan pelanggan jika nama atau nomor HP diberikan.
        $idPelanggan = null;

        if ($namaPelanggan !== '' || $noHp !== '') {
            $stmtPelanggan = $pdo->prepare(
                'INSERT INTO pelanggan (nama, no_hp)
                 VALUES (:nama, :no_hp)'
            );

            $stmtPelanggan->execute([
                ':nama' => $namaPelanggan !== '' ? $namaPelanggan : null,
                ':no_hp' => $noHp !== '' ? $noHp : null
            ]);

            $idPelanggan = (int) $pdo->lastInsertId();
        }

        // Ambil harga dari database.
        $stmtLayanan = $pdo->prepare(
            'SELECT harga
             FROM layanan
             WHERE id_layanan = :id
               AND aktif = 1'
        );

        $rincian = [];
        $totalHarga = 0;

        foreach ($jumlahPerLayanan as $idLayanan => $jumlah) {
            $stmtLayanan->execute([':id' => $idLayanan]);
            $layanan = $stmtLayanan->fetch(PDO::FETCH_ASSOC);

            if (!$layanan) {
                throw new DomainException(
                    "Layanan ID {$idLayanan} tidak ditemukan atau tidak aktif."
                );
            }

            $harga = (int) $layanan['harga'];

            if ($harga > intdiv(PHP_INT_MAX - $totalHarga, $jumlah)) {
                throw new DomainException('Total harga terlalu besar.');
            }

            $totalHarga += $harga * $jumlah;

            $rincian[] = [
                'id_layanan' => (int) $idLayanan,
                'harga' => $harga,
                'jumlah' => $jumlah
            ];
        }

        $tanggal = date('Y-m-d');
        $waktu = date('H:i:s');

        // Pencatat berasal dari sesi login.
        // Barber berasal dari pilihan owner atau sesi barber.
        $stmtTransaksi = $pdo->prepare(
            'INSERT INTO transaksi
                (id_pencatat, id_barber, id_pelanggan,
                 tanggal, waktu, total_harga)
             VALUES
                (:id_pencatat, :id_barber, :id_pelanggan,
                 :tanggal, :waktu, :total_harga)'
        );

        $stmtTransaksi->execute([
            ':id_pencatat' => $idUser,
            ':id_barber' => $idBarber,
            ':id_pelanggan' => $idPelanggan,
            ':tanggal' => $tanggal,
            ':waktu' => $waktu,
            ':total_harga' => $totalHarga
        ]);

        $idTransaksi = (int) $pdo->lastInsertId();

        $stmtDetail = $pdo->prepare(
            'INSERT INTO detail_transaksi
                (id_transaksi, id_layanan, harga_saat_transaksi, jumlah)
             VALUES
                (:id_transaksi, :id_layanan, :harga, :jumlah)'
        );

        foreach ($rincian as $item) {
            $stmtDetail->execute([
                ':id_transaksi' => $idTransaksi,
                ':id_layanan' => $item['id_layanan'],
                ':harga' => $item['harga'],
                ':jumlah' => $item['jumlah']
            ]);
        }

        $pdo->commit();

        kirimJson(201, [
            'success' => true,
            'message' => 'Transaksi berhasil dicatat.',
            'data' => [
                'id_transaksi' => $idTransaksi,
                'id_pencatat' => $idUser,
                'id_barber' => $idBarber,
                'id_pelanggan' => $idPelanggan,
                'tanggal' => $tanggal,
                'waktu' => $waktu,
                'total_harga' => $totalHarga,
                'layanan' => $rincian
            ]
        ]);
    }

    // Method selain GET dan POST ditolak.
    header('Allow: GET, POST');

    kirimJson(405, [
        'success' => false,
        'message' => 'Method tidak didukung.',
        'error_code' => 'METHOD_NOT_ALLOWED'
    ]);

} catch (DomainException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    kirimJson(422, [
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => 'VALIDATION_ERROR'
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('API transaksi: ' . $e->getMessage());

    kirimJson(500, [
        'success' => false,
        'message' => 'Terjadi kesalahan pada server.',
        'error_code' => 'INTERNAL_SERVER_ERROR'
    ]);
}
