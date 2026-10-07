<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_role(['barber', 'owner']);

require_once __DIR__ . '/../config/config.php';


// ======================================================
// WAKTU WIB
// ======================================================

$zonaWIB = new DateTimeZone('Asia/Jakarta');

$sekarang = new DateTimeImmutable(
    'now',
    $zonaWIB
);

$tanggalHariIni = $sekarang->format('Y-m-d');


// ======================================================
// AMBIL SEMUA LAYANAN AKTIF
// ======================================================

$stmt = $pdo->query(
    "SELECT
        id_layanan,
        nama_layanan,
        harga
     FROM layanan
     WHERE aktif = 1
     ORDER BY nama_layanan ASC"
);

$layanan = $stmt->fetchAll(PDO::FETCH_ASSOC);


// ======================================================
// AMBIL SEMUA AKUN AKTIF
// UNTUK BARBER PELAKSANA
// ======================================================

$stmtBarber = $pdo->query(
    "SELECT
        id_user,
        nama,
        role
     FROM users
     WHERE aktif = 1
     AND role IN ('barber', 'owner')
     ORDER BY nama ASC"
);

$daftarBarber = $stmtBarber->fetchAll(PDO::FETCH_ASSOC);


// ======================================================
// AMBIL RIWAYAT TRANSAKSI HARI INI
// ======================================================

$stmtHistory = $pdo->prepare(
    "SELECT
        t.id_transaksi,
        t.tanggal,
        t.waktu,
        t.total_harga,
        p.nama AS pencatat,
        b.nama AS barber_pelaksana
     FROM transaksi t
     JOIN users p
        ON t.id_pencatat = p.id_user
     JOIN users b
        ON t.id_barber = b.id_user
     WHERE t.tanggal = ?
     ORDER BY t.waktu DESC, t.id_transaksi DESC"
);

$stmtHistory->execute([
    $tanggalHariIni
]);

$historyTransaksi = $stmtHistory->fetchAll(PDO::FETCH_ASSOC);


// ======================================================
// PESAN ERROR / SUCCESS
// ======================================================

$error = $_GET['error'] ?? '';

$success = $_GET['success'] ?? '';

?>

<?php include __DIR__ . '/../includes/header.php'; ?>


<div class="dashboard-page">


    <!-- ==================================================
         JUDUL HALAMAN
    =================================================== -->

    <div class="dashboard-heading">

        <h1>Kasir</h1>

        <p>
            Catat layanan yang dikerjakan barber.
        </p>

    </div>


    <!-- ==================================================
         PESAN ERROR
    =================================================== -->

    <?php if ($error === 'no_service'): ?>

        <div style="
            padding: 14px 18px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: #FEEAEA;
            color: #D64545;
            border: 1px solid #F5B5B5;
            font-weight: 600;
        ">
            Pilih minimal satu layanan
        </div>


    <?php elseif ($error === 'price_invalid'): ?>

        <div style="
            padding: 14px 18px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: #FEEAEA;
            color: #D64545;
            border: 1px solid #F5B5B5;
            font-weight: 600;
        ">
            Harga harus lebih dari nol
        </div>


    <?php elseif ($error === 'invalid_barber'): ?>

        <div style="
            padding: 14px 18px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: #FEEAEA;
            color: #D64545;
            border: 1px solid #F5B5B5;
            font-weight: 600;
        ">
            Pilih barber yang valid
        </div>


    <?php elseif ($error === 'invalid'): ?>

        <div style="
            padding: 14px 18px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: #FEEAEA;
            color: #D64545;
            border: 1px solid #F5B5B5;
            font-weight: 600;
        ">
            Data transaksi tidak valid.
        </div>


    <?php elseif ($error === 'failed'): ?>

        <div style="
            padding: 14px 18px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: #FEEAEA;
            color: #D64545;
            border: 1px solid #F5B5B5;
            font-weight: 600;
        ">
            Transaksi gagal disimpan. Silakan coba lagi.
        </div>

    <?php endif; ?>


    <!-- ==================================================
         PESAN BERHASIL
    =================================================== -->

    <?php if ($success === '1'): ?>

        <div style="
            padding: 14px 18px;
            margin-bottom: 20px;
            border-radius: 10px;
            background: #E6F4EC;
            color: #2E9E5B;
            border: 1px solid #A9DDBD;
            font-weight: 600;
        ">
            Transaksi berhasil disimpan.
        </div>

    <?php endif; ?>


    <!-- ==================================================
         FORM KASIR
    =================================================== -->

    <div style="
        background: #FFFFFF;
        border: 1px solid #E2E4F0;
        border-radius: 14px;
        padding: 24px;
    ">

        <form
            method="POST"
            action="/KELOMPOK-5/pages/catat_transaksi_proses.php"
        >


            <!-- ==========================================
                 PILIH BARBER
            =========================================== -->

            <div style="margin-bottom: 24px;">

                <label style="
                    display: block;
                    font-size: 14px;
                    color: #6B6B6B;
                    margin-bottom: 6px;
                    font-weight: 600;
                ">
                    Nama Barber
                </label>


                <select
                    name="id_barber"
                    required
                    style="
                        width: 100%;
                        max-width: 400px;
                        padding: 11px 12px;
                        border: 1px solid #D9DCE8;
                        border-radius: 8px;
                        background: #FFFFFF;
                    "
                >

                    <option value="">
                        Pilih barber
                    </option>


                    <?php foreach ($daftarBarber as $barber): ?>

                        <option
                            value="<?= (int) $barber['id_user'] ?>"
                            <?= (
                                (int) $barber['id_user']
                                ===
                                (int) ($_SESSION['id_user'] ?? 0)
                            ) ? 'selected' : '' ?>
                        >

                            <?= htmlspecialchars(
                                $barber['nama']
                            ) ?>

                            (<?= htmlspecialchars(
                                $barber['role']
                            ) ?>)

                        </option>

                    <?php endforeach; ?>

                </select>

            </div>


            <!-- ==========================================
                 PILIH LAYANAN
            =========================================== -->

            <h2 style="
                margin-top: 0;
                margin-bottom: 20px;
            ">
                Pilih Layanan
            </h2>


            <?php if (empty($layanan)): ?>

                <p style="
                    color: #D64545;
                    font-weight: 600;
                ">
                    Belum ada layanan aktif.
                </p>


            <?php else: ?>


                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                ">


                    <?php foreach ($layanan as $item): ?>

                        <div style="
                            border: 1px solid #E2E4F0;
                            border-radius: 12px;
                            padding: 16px;
                        ">


                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                flex-wrap: wrap;
                            ">


                                <!-- =================================
                                     CHECKBOX LAYANAN
                                ================================== -->

                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 10px;
                                    min-width: 260px;
                                    flex: 1;
                                    cursor: pointer;
                                ">


                                    <input
                                        type="checkbox"
                                        name="layanan[]"
                                        value="<?= (int) $item['id_layanan'] ?>"
                                    >


                                    <span>

                                        <strong>

                                            <?= htmlspecialchars(
                                                $item['nama_layanan']
                                            ) ?>

                                        </strong>


                                        <br>


                                        <span style="
                                            color: #6B6B6B;
                                        ">

                                            Harga:

                                            Rp<?= number_format(
                                                (int) $item['harga'],
                                                0,
                                                ',',
                                                '.'
                                            ) ?>

                                        </span>

                                    </span>

                                </label>


                                <!-- =================================
                                     JUMLAH
                                ================================== -->

                                <div>

                                    <label style="
                                        display: block;
                                        font-size: 13px;
                                        color: #6B6B6B;
                                        margin-bottom: 4px;
                                    ">

                                        Jumlah

                                    </label>


                                    <input
                                        type="number"
                                        name="jumlah[<?= (int) $item['id_layanan'] ?>]"
                                        value="1"
                                        min="1"
                                        style="
                                            width: 90px;
                                            padding: 9px 10px;
                                            border: 1px solid #D9DCE8;
                                            border-radius: 8px;
                                        "
                                    >

                                </div>


                                <!-- =================================
                                     HARGA MANUAL
                                ================================== -->

                                <div>

                                    <label style="
                                        display: block;
                                        font-size: 13px;
                                        color: #6B6B6B;
                                        margin-bottom: 4px;
                                    ">

                                        Harga Manual (opsional)

                                    </label>


                                    <input
                                        type="number"
                                        name="harga_manual[<?= (int) $item['id_layanan'] ?>]"
                                        min="0"
                                        step="1"
                                        placeholder="<?= (int) $item['harga'] ?>"
                                        style="
                                            width: 150px;
                                            padding: 9px 10px;
                                            border: 1px solid #D9DCE8;
                                            border-radius: 8px;
                                        "
                                    >

                                </div>


                            </div>

                        </div>

                    <?php endforeach; ?>


                </div>


                <!-- ======================================
                     TOMBOL
                ======================================= -->

                <div style="
                    margin-top: 24px;
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                ">


                    <button
                        type="submit"
                        style="
                            border: none;
                            background: #17186B;
                            color: white;
                            padding: 12px 24px;
                            border-radius: 9px;
                            font-weight: 600;
                            cursor: pointer;
                        "
                    >

                        Simpan Transaksi

                    </button>


                    <a
                        href="/KELOMPOK-5/pages/transaksi.php"
                        style="
                            display: inline-block;
                            padding: 12px 24px;
                            border-radius: 9px;
                            background: #F3F4FA;
                            color: #17186B;
                            text-decoration: none;
                            font-weight: 600;
                        "
                    >

                        Batal

                    </a>


                </div>


            <?php endif; ?>


        </form>

    </div>


    <!-- ==================================================
         HISTORY TRANSAKSI HARI INI
    =================================================== -->

    <div style="
        background: #FFFFFF;
        border: 1px solid #E2E4F0;
        border-radius: 14px;
        padding: 24px;
        margin-top: 24px;
    ">


        <h2 style="
            margin-top: 0;
            margin-bottom: 6px;
        ">
            Riwayat Transaksi Hari Ini
        </h2>


        <p style="
            color: #6B6B6B;
            margin-top: 0;
            margin-bottom: 20px;
        ">

            <?= htmlspecialchars($tanggalHariIni) ?>

        </p>


        <?php if (empty($historyTransaksi)): ?>


            <p style="
                color: #6B6B6B;
            ">

                Belum ada transaksi hari ini.

            </p>


        <?php else: ?>


            <div style="
                overflow-x: auto;
            ">


                <table style="
                    width: 100%;
                    border-collapse: collapse;
                ">


                    <thead>

                        <tr style="
                            border-bottom: 1px solid #E2E4F0;
                        ">


                            <th style="
                                padding: 12px;
                                text-align: left;
                            ">
                                ID
                            </th>


                            <th style="
                                padding: 12px;
                                text-align: left;
                            ">
                                Waktu
                            </th>


                            <th style="
                                padding: 12px;
                                text-align: left;
                            ">
                                Pencatat
                            </th>


                            <th style="
                                padding: 12px;
                                text-align: left;
                            ">
                                Barber
                            </th>


                            <th style="
                                padding: 12px;
                                text-align: right;
                            ">
                                Total
                            </th>


                        </tr>

                    </thead>


                    <tbody>


                        <?php foreach ($historyTransaksi as $transaksi): ?>


                            <tr style="
                                border-bottom: 1px solid #F0F1F5;
                            ">


                                <td style="
                                    padding: 12px;
                                ">

                                    #<?= (int) $transaksi['id_transaksi'] ?>

                                </td>


                                <td style="
                                    padding: 12px;
                                ">

                                    <?= htmlspecialchars(
                                        substr(
                                            $transaksi['waktu'],
                                            0,
                                            5
                                        )
                                    ) ?>

                                </td>


                                <td style="
                                    padding: 12px;
                                ">

                                    <?= htmlspecialchars(
                                        $transaksi['pencatat']
                                    ) ?>

                                </td>


                                <td style="
                                    padding: 12px;
                                ">

                                    <?= htmlspecialchars(
                                        $transaksi['barber_pelaksana']
                                    ) ?>

                                </td>


                                <td style="
                                    padding: 12px;
                                    text-align: right;
                                    font-weight: 600;
                                ">

                                    Rp<?= number_format(
                                        (int) $transaksi['total_harga'],
                                        0,
                                        ',',
                                        '.'
                                    ) ?>

                                </td>


                            </tr>


                        <?php endforeach; ?>


                    </tbody>


                </table>


            </div>


        <?php endif; ?>


    </div>


</div>


<?php include __DIR__ . '/../includes/footer.php'; ?>