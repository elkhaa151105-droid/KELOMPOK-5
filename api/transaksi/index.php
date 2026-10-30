
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
                t.metode_pembayaran,
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

        $namaPelangganRaw = $input['nama_pelanggan'] ?? '';
        $noHpRaw = $input['no_hp'] ?? '';
        if (!is_string($namaPelangganRaw) || !is_string($noHpRaw)) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Data pelanggan tidak valid.'
            ]);
        }
        $namaPelanggan = trim($namaPelangganRaw);
        $noHp = trim($noHpRaw);
        $layananInput = $input['layanan'] ?? [];
        $metodePembayaran = $input['metode_pembayaran'] ?? '';

        if (
    !is_string($metodePembayaran) ||
    trim($metodePembayaran) === ''
) {
    kirimJson(422, [
        'success' => false,
        'message' => 'Pilih metode pembayaran.',
        'error_code' => 'VALIDATION_ERROR'
    ]);
}

        if ($namaPelanggan === '') {
            kirimJson(422, [
                'success' => false,
                'message' => 'Nama pelanggan wajib diisi',
                'error_code' => 'CUSTOMER_NAME_REQUIRED'
            ]);
        }

        if (
            !is_string($metodePembayaran) ||
            !in_array($metodePembayaran, ['cash', 'qris', 'transfer'], true) ||
            strlen($namaPelanggan) > 100 ||
            strlen($noHp) > 20
        ) {
            kirimJson(422, [
                'success' => false,
                'message' => 'Data pembayaran atau pelanggan tidak valid.'
            ]);
        }

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
                   AND role IN ('barber', 'owner')
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

        // Gunakan pelanggan yang dipilih, atau buat pelanggan baru.
$idPelangganInput = $input['id_pelanggan'] ?? null;
$idPelanggan = null;

if ($idPelangganInput !== null && $idPelangganInput !== '') {
    $idPelangganTerpilih = filter_var(
        $idPelangganInput,
        FILTER_VALIDATE_INT
    );

    if ($idPelangganTerpilih === false || $idPelangganTerpilih < 1) {
        kirimJson(422, [
            'success' => false,
            'message' => 'ID pelanggan tidak valid.',
            'error_code' => 'VALIDATION_ERROR'
        ]);
    }

    $stmtPelanggan = $pdo->prepare(
        'SELECT id_pelanggan, nama, no_hp
         FROM pelanggan
         WHERE id_pelanggan = :id
         LIMIT 1'
    );

    $stmtPelanggan->execute([
        ':id' => $idPelangganTerpilih
    ]);

    $pelanggan = $stmtPelanggan->fetch(PDO::FETCH_ASSOC);

    if (!$pelanggan) {
        kirimJson(422, [
            'success' => false,
            'message' => 'Pelanggan yang dipilih tidak ditemukan.',
            'error_code' => 'CUSTOMER_NOT_FOUND'
        ]);
    }

    // Gunakan data pelanggan yang tersimpan di database.
    $idPelanggan = (int) $pelanggan['id_pelanggan'];
} else {
    // Nama wajib diisi meskipun pelanggan baru belum memiliki nomor HP.
    if ($namaPelanggan === '') {
        kirimJson(422, [
            'success' => false,
            'message' => 'Nama pelanggan wajib diisi',
            'error_code' => 'CUSTOMER_NAME_REQUIRED'
        ]);
    }

    $stmtPelanggan = $pdo->prepare(
        'INSERT INTO pelanggan (nama, no_hp)
         VALUES (:nama, :no_hp)'
    );

    $stmtPelanggan->execute([
        ':nama' => $namaPelanggan,
        ':no_hp' => $noHp !== '' ? $noHp : null
    ]);

    $idPelanggan = (int) $pdo->lastInsertId();
}
        // Ambil harga dari database.
$stmtLayanan = $pdo->prepare(
    'SELECT nama_layanan, harga, hpp
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
            if ($totalHarga > 2147483647) {
                throw new DomainException('Total harga terlalu besar.');
            }


$rincian[] = [
    'id_layanan' => (int) $idLayanan,
    'nama_layanan' => $layanan['nama_layanan'],
    'harga' => $harga,
    'hpp_saat_transaksi' => $layanan['hpp'] === null ? null : (int) $layanan['hpp'],
    'jumlah' => $jumlah
];

        }

        $sekarang = new DateTimeImmutable('now', new DateTimeZone('Asia/Jakarta'));
        $tanggal = $sekarang->format('Y-m-d');
        $waktu = $sekarang->format('H:i:s');

        // Pencatat berasal dari sesi login.
        // Barber berasal dari pilihan owner atau sesi barber.
        $stmtTransaksi = $pdo->prepare(
            'INSERT INTO transaksi
                (id_pencatat, id_barber, id_pelanggan,
                 tanggal, waktu, total_harga, metode_pembayaran)
             VALUES
                (:id_pencatat, :id_barber, :id_pelanggan,
                 :tanggal, :waktu, :total_harga, :metode_pembayaran)'
        );

        $stmtTransaksi->execute([
            ':id_pencatat' => $idUser,
            ':id_barber' => $idBarber,
            ':id_pelanggan' => $idPelanggan,
            ':tanggal' => $tanggal,
            ':waktu' => $waktu,
            ':total_harga' => $totalHarga,
            ':metode_pembayaran' => $metodePembayaran
        ]);

        $idTransaksi = (int) $pdo->lastInsertId();


$stmtDetail = $pdo->prepare(
    'INSERT INTO detail_transaksi
        (
            id_transaksi,
            id_layanan,
            nama_layanan_saat_transaksi,
            harga_saat_transaksi,
            hpp_saat_transaksi,
            jumlah
        )
     VALUES
        (
            :id_transaksi,
            :id_layanan,
            :nama_layanan,
            :harga,
            :hpp,
            :jumlah
        )'
);

foreach ($rincian as $item) {
    $stmtDetail->execute([
        ':id_transaksi' => $idTransaksi,
        ':id_layanan' => $item['id_layanan'],
        ':nama_layanan' => $item['nama_layanan'],
        ':harga' => $item['harga'],
        ':hpp' => $item['hpp_saat_transaksi'],
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
                'metode_pembayaran' => $metodePembayaran,
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
