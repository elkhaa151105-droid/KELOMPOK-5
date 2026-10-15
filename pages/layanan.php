
<?php
require_once __DIR__ . '/../includes/auth_check.php';

require_role(['owner']);

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$status = $_GET['status'] ?? '';
$message = '';
$message_type = 'success';

switch ($status) {
    case 'tambah_sukses':
        $message = 'Layanan berhasil ditambahkan.';
        break;

    case 'ubah_sukses':
        $message = 'Layanan berhasil diperbarui.';
        break;

    case 'nonaktif_sukses':
        $message = 'Layanan berhasil dinonaktifkan.';
        break;

    case 'status_sukses':
        $message = 'Status layanan berhasil diperbarui.';
        break;

    case 'hapus_sukses':
        $message = 'Layanan berhasil dihapus.';
        break;

    case 'layanan_digunakan':
        $message = 'Layanan yang tercatat pada transaksi tidak dapat dihapus.';
        $message_type = 'error';
        break;

    case 'harga_invalid':
        $message = 'Harga harus lebih dari nol.';
        $message_type = 'error';
        break;

    case 'hpp_invalid':
        $message = 'HPP wajib diisi dengan bilangan bulat nol atau lebih.';
        $message_type = 'error';
        break;

    case 'nama_kosong':
        $message = 'Nama layanan wajib diisi.';
        $message_type = 'error';
        break;

    case 'nama_invalid':
        $message = 'Nama layanan maksimal 100 karakter dan tidak boleh duplikat.';
        $message_type = 'error';
        break;

    case 'gagal':
        $message = 'Terjadi kesalahan. Silakan coba lagi.';
        $message_type = 'error';
        break;
}

$stmt = $pdo->query(
    'SELECT id_layanan, nama_layanan, harga, hpp, aktif, dibuat_pada
     FROM layanan
     ORDER BY id_layanan DESC'
);

$layanan = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="layanan-page">
    <div class="layanan-heading">
        <h1>Layanan</h1>
    </div>

    <section class="layanan-card" aria-label="Daftar layanan">
        <?php if ($message !== ''): ?>
            <div
                id="layananNotifikasi"
                class="layanan-notifikasi <?= $message_type === 'error' ? 'error' : 'berhasil' ?>"
                role="status"
                aria-live="polite"
            >
                <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>

        <div class="layanan-table-wrapper">
            <table class="layanan-table layanan-table-crud">
                <thead>
                    <tr>
                        <th>Layanan</th>
                        <th>Harga</th>
                        <th>HPP</th>
                        <th>Aktif</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($layanan)): ?>
                        <tr>
                            <td colspan="5" class="layanan-empty">Belum ada layanan.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($layanan as $item): ?>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        class="layanan-name-input"
                                        name="nama_layanan"
                                        form="ubah-layanan-<?= (int) $item['id_layanan'] ?>"
                                        aria-label="Nama layanan"
                                        value="<?= htmlspecialchars($item['nama_layanan'], ENT_QUOTES, 'UTF-8') ?>"
                                        maxlength="100"
                                        readonly
                                        required
                                    >
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="layanan-price-input"
                                        name="harga"
                                        form="ubah-layanan-<?= (int) $item['id_layanan'] ?>"
                                        aria-label="Harga layanan"
                                        value="<?= (int) $item['harga'] ?>"
                                        min="1"
                                        max="2147483647"
                                        step="1"
                                        readonly
                                        required
                                    >
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="layanan-hpp-input"
                                        name="hpp"
                                        form="ubah-layanan-<?= (int) $item['id_layanan'] ?>"
                                        aria-label="HPP layanan"
                                        value="<?= $item['hpp'] === null ? '' : (int) $item['hpp'] ?>"
                                        min="0"
                                        max="2147483647"
                                        step="1"
                                        readonly
                                        <?= $item['hpp'] === null ? '' : 'required' ?>
                                    >
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        class="layanan-checkbox"
                                        <?= (int) $item['aktif'] === 1 ? 'checked' : '' ?>
                                        form="status-layanan-<?= (int) $item['id_layanan'] ?>"
                                        data-status-form="status-layanan-<?= (int) $item['id_layanan'] ?>"
                                        aria-label="<?= (int) $item['aktif'] === 1 ? 'Layanan aktif' : 'Layanan nonaktif' ?>"
                                    >
                                </td>
                                <td class="layanan-aksi">
                                    <div class="layanan-actions">
                                        <form
                                            id="ubah-layanan-<?= (int) $item['id_layanan'] ?>"
                                            class="layanan-edit-form"
                                            action="/KELOMPOK-5/pages/layanan_proses.php"
                                            method="POST"
                                        >
                                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
                                            <input type="hidden" name="action" value="ubah">
                                            <input type="hidden" name="id_layanan" value="<?= (int) $item['id_layanan'] ?>">
                                            <button type="button" class="layanan-edit-button">Edit</button>
                                        </form>
                                        <?php if ((int) $item['aktif'] === 1): ?>
                                            <form
                                                class="layanan-deactivate-form"
                                                action="/KELOMPOK-5/pages/layanan_proses.php"
                                                method="POST"
                                                onsubmit="return confirm('Yakin ingin menonaktifkan layanan ini?');"
                                            >
                                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
                                                <input type="hidden" name="action" value="nonaktifkan">
                                                <input type="hidden" name="id_layanan" value="<?= (int) $item['id_layanan'] ?>">
                                                <button type="submit" class="layanan-nonaktif-button">Nonaktifkan</button>
                                            </form>
                                        <?php else: ?>
                                            <button type="button" class="layanan-nonaktif-button" data-layanan-nonaktif>Nonaktifkan</button>
                                        <?php endif; ?>
                                        <form
                                            action="/KELOMPOK-5/pages/layanan_proses.php"
                                            method="POST"
                                            onsubmit="return confirm('Hapus layanan ini secara permanen? Layanan yang sudah dipakai pada transaksi tidak dapat dihapus.');"
                                        >
                                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
                                            <input type="hidden" name="action" value="hapus">
                                            <input type="hidden" name="id_layanan" value="<?= (int) $item['id_layanan'] ?>">
                                            <button type="submit" class="layanan-hapus-button">Hapus</button>
                                        </form>
                                    </div>
                                    <form id="status-layanan-<?= (int) $item['id_layanan'] ?>" class="layanan-status-form" action="/KELOMPOK-5/pages/layanan_proses.php" method="POST">
                                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
                                        <input type="hidden" name="action" value="status">
                                        <input type="hidden" name="id_layanan" value="<?= (int) $item['id_layanan'] ?>">
                                        <input type="hidden" name="aktif" value="<?= (int) $item['aktif'] ?>">
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </section>

    <section class="layanan-card tambah-layanan-card">
        <h2>Tambah Layanan</h2>
        <form
            id="formTambahLayanan"
            class="tambah-layanan-form"
            action="/KELOMPOK-5/pages/layanan_proses.php"
            method="POST"
            novalidate
        >
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
            <input type="hidden" name="action" value="tambah">
            <div class="layanan-input-group">
                <label for="namaLayanan">Nama</label>
                <input
                    type="text"
                    id="namaLayanan"
                    name="nama_layanan"
                    maxlength="100"
                    required
                    placeholder="Nama layanan"
                >
                <span id="errorNamaLayanan" class="layanan-error" aria-live="polite"></span>
            </div>
            <div class="layanan-input-group">
                <label for="hargaLayanan">Harga</label>
                <input
                    type="number"
                    id="hargaLayanan"
                    name="harga"
                    min="1"
                    max="2147483647"
                    step="1"
                    required
                    placeholder="Harga layanan"
                >
                <span id="errorHargaLayanan" class="layanan-error" aria-live="polite"></span>
            </div>
            <div class="layanan-input-group">
                <label for="hppLayanan">HPP</label>
                <input
                    type="number"
                    id="hppLayanan"
                    class="layanan-hpp-input"
                    name="hpp"
                    min="0"
                    max="2147483647"
                    step="1"
                    required
                    placeholder="HPP layanan"
                >
                <span id="errorHppLayanan" class="layanan-error" aria-live="polite"></span>
            </div>
            <button type="submit" class="layanan-submit">Tambah</button>
        </form>
    </section>
</div>

<script>
    const tabelLayanan = document.querySelector('.layanan-table-wrapper');
    if (tabelLayanan) tabelLayanan.scrollLeft = 0;

    const notifikasiLayanan = document.getElementById('layananNotifikasi');
    if (notifikasiLayanan) {
        window.setTimeout(() => notifikasiLayanan.remove(), 3000);
    }

    document.querySelectorAll('.layanan-edit-form').forEach((form) => {
        const row = form.closest('tr');
        const editButton = form.querySelector('.layanan-edit-button');
        const fields = row.querySelectorAll(
            '.layanan-name-input, .layanan-price-input, .layanan-hpp-input'
        );
        const hppWasNull = fields[2].value === '';

        editButton.addEventListener('click', () => {
            const namaBaru = window.prompt('Nama layanan:', fields[0].value);
            if (namaBaru === null) return;
            if (namaBaru.trim() === '') {
                window.alert('Nama layanan wajib diisi');
                return;
            }

            const hargaBaru = window.prompt('Harga layanan:', fields[1].value);
            if (hargaBaru === null) return;
            if (!/^\d+$/.test(hargaBaru.trim()) || Number(hargaBaru) < 1 || Number(hargaBaru) > 2147483647) {
                window.alert('Harga harus bilangan bulat lebih dari nol');
                return;
            }

            const hppBaru = window.prompt('HPP layanan:', fields[2].value);
            if (hppBaru === null) return;
            const nilaiHpp = hppBaru.trim();
            if (nilaiHpp === '' && !hppWasNull) {
                window.alert('HPP wajib diisi');
                return;
            }
            if (nilaiHpp !== '' && (!/^\d+$/.test(nilaiHpp) || Number(nilaiHpp) > 2147483647)) {
                window.alert('HPP harus bilangan bulat nol atau lebih');
                return;
            }

            fields[0].value = namaBaru.trim();
            fields[1].value = Number(hargaBaru);
            fields[2].value = nilaiHpp === '' ? '' : Number(nilaiHpp);
            fields[2].required = nilaiHpp !== '';
            form.requestSubmit();
        });

        form.addEventListener('submit', () => {
            editButton.disabled = true;
            editButton.textContent = 'Menyimpan...';
        });
    });

    document.querySelectorAll('[data-layanan-nonaktif]').forEach((button) => {
        button.addEventListener('click', () => {
            alert('Layanan sudah nonaktif');
        });
    });

    document.querySelectorAll('.layanan-checkbox[data-status-form]').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            const form = document.getElementById(checkbox.dataset.statusForm);
            if (!form) return;
            form.elements.aktif.value = checkbox.checked ? '1' : '0';
            form.requestSubmit();
        });
    });

    const formTambah = document.getElementById('formTambahLayanan');
    if (formTambah) {
        formTambah.addEventListener('submit', (event) => {
            const nama = formTambah.elements.nama_layanan;
            const harga = formTambah.elements.harga;
            const hpp = formTambah.elements.hpp;
            const errors = [
                document.getElementById('errorNamaLayanan'),
                document.getElementById('errorHargaLayanan'),
                document.getElementById('errorHppLayanan')
            ];
            errors.forEach((error) => { error.textContent = ''; });
            [nama, harga, hpp].forEach((input) => input.classList.remove('is-invalid'));

            let valid = true;
            const nilaiHarga = Number(harga.value);
            const nilaiHpp = Number(hpp.value);
            if (!nama.value.trim()) {
                errors[0].textContent = 'Nama wajib diisi';
                valid = false;
            } else {
                const namaSudahAda = Array.from(
                    document.querySelectorAll('.layanan-name-input')
                ).some((input) => input.value.trim().toLocaleLowerCase() === nama.value.trim().toLocaleLowerCase());
                if (namaSudahAda) {
                    errors[0].textContent = 'Nama layanan sudah ada';
                    valid = false;
                }
            }
            if (!Number.isSafeInteger(nilaiHarga) || nilaiHarga < 1 || nilaiHarga > 2147483647) {
                errors[1].textContent = 'Harga harus bilangan bulat lebih dari nol';
                valid = false;
            }
            if (!Number.isSafeInteger(nilaiHpp) || nilaiHpp < 0 || nilaiHpp > 2147483647) {
                errors[2].textContent = 'HPP wajib diisi dengan bilangan bulat nol atau lebih';
                valid = false;
            }
            if (!valid) event.preventDefault();
            [nama, harga, hpp].forEach((input, index) => {
                input.classList.toggle('is-invalid', errors[index].textContent !== '');
            });
        });
    }
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
