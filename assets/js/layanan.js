document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formTambahLayanan');
    const namaInput = document.getElementById('namaLayanan');
    const hargaInput = document.getElementById('hargaLayanan');
    const hppInput = document.getElementById('hppLayanan');
    const tableBody = document.getElementById('layananTableBody');
    const notifikasiElement = document.getElementById('layananNotifikasi');

    const API_LAYANAN = '/KELOMPOK-5/api/layanan/index.php';

    // HPP sementara di frontend, belum terhubung ke database.
    const hppSementara = {
        'Haircut': 5000,
        'Colouring': 50000,
        'Perming': 25000,
        'Smoothing': 10000,
        'Creambath': 15000
    };

    let timerNotifikasi;

   function tampilkanNotifikasi(pesan, jenis = 'berhasil') {
    if (!notifikasiElement) {
        console.error('Elemen notifikasi tidak ditemukan!');
        return;
    }

    clearTimeout(timerNotifikasi);
    notifikasiElement.textContent = pesan;
    notifikasiElement.className = 'layanan-notifikasi ' + jenis;

    timerNotifikasi = setTimeout(function () {
        notifikasiElement.textContent = '';
        notifikasiElement.className = 'layanan-notifikasi';
    }, 3000);
}

// Fungsi sementara untuk mengetes notifikasi.
window.tesNotifikasiLayanan = function () {
    tampilkanNotifikasi(
        'Tes notifikasi HPP berhasil!',
        'simulasi'
    );
};

    function hapusError() {
        document.getElementById('errorNamaLayanan').textContent = '';
        document.getElementById('errorHargaLayanan').textContent = '';
        document.getElementById('errorHppLayanan').textContent = '';
    }

    function buatInput(namaClass, nilai, tipe = 'number') {
        const input = document.createElement('input');
        input.type = tipe;
        input.className = namaClass;
        input.value = nilai;

        if (tipe === 'number') {
            input.min = '0';
        }

        return input;
    }

    function siapkanBaris(row) {
        const kolomAksi = row.querySelector('.layanan-aksi');
        if (!kolomAksi) return;

        if (kolomAksi.querySelector('.layanan-edit-button')) return;

        // Edit: perubahan hanya berlaku pada tampilan.
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'layanan-edit-button';
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', function () {
            const namaCell = row.cells[0];
            const harga = row.querySelector('.layanan-price-input');
            const hpp = row.querySelector('.layanan-hpp-input');

            const namaBaru = prompt('Nama layanan:', namaCell.textContent.trim());
            if (namaBaru === null) return;

            if (!namaBaru.trim()) {
                tampilkanNotifikasi('Nama layanan wajib diisi.', 'gagal');
                return;
            }

            const hargaBaru = prompt('Harga layanan:', harga.value);
            if (hargaBaru === null) return;

            if (hargaBaru.trim() === '' ||
                !Number.isFinite(Number(hargaBaru)) ||
                Number(hargaBaru) <= 0) {
                tampilkanNotifikasi('Harga harus lebih dari nol.', 'gagal');
                return;
            }

            const namaLama = namaCell.textContent.trim();
            const namaFinal = namaBaru.trim();

            const namaDuplikat = Array.from(
                tableBody.querySelectorAll('tr[data-service-row]')
            ).some(function (baris) {
                return baris !== row &&
                    baris.cells[0].textContent.trim().toLowerCase() ===
                    namaFinal.toLowerCase();
            });

            if (namaDuplikat) {
                tampilkanNotifikasi('Nama layanan sudah digunakan.', 'gagal');
                return;
            }

            const hppLama = hpp.value;

            namaCell.textContent = namaFinal;
            harga.value = Number(hargaBaru);

            // Pindahkan nilai HPP sementara jika nama layanan berubah.
            if (Object.prototype.hasOwnProperty.call(hppSementara, namaLama)) {
                hppSementara[namaFinal] = Number(hppLama);
                delete hppSementara[namaLama];
            }

            tampilkanNotifikasi(
                'Perubahan ditampilkan sementara, belum tersimpan ke database.',
                'simulasi'
            );
        });

        // Nonaktifkan: hanya mengubah checkbox pada tampilan.
        const nonaktifButton = document.createElement('button');
        nonaktifButton.type = 'button';
        nonaktifButton.className = 'layanan-nonaktif-button';
        nonaktifButton.textContent = 'Nonaktifkan';

        nonaktifButton.addEventListener('click', function () {
            const checkbox = row.querySelector('.layanan-checkbox');

            if (!checkbox || !checkbox.checked) {
                tampilkanNotifikasi('Layanan sudah nonaktif.', 'simulasi');
                return;
            }

            if (confirm('Nonaktifkan layanan ini sementara?')) {
                checkbox.checked = false;
                tampilkanNotifikasi(
                    'Status hanya berubah pada tampilan, belum tersimpan.',
                    'simulasi'
                );
            }
        });

        // Hapus: hanya menghapus baris dari tampilan.
        const hapusButton = document.createElement('button');
        hapusButton.type = 'button';
        hapusButton.className = 'layanan-hapus-button';
        hapusButton.textContent = 'Hapus';

        hapusButton.addEventListener('click', function () {
            const nama = row.cells[0].textContent.trim();

            if (confirm('Hapus layanan "' + nama + '" dari tampilan sementara?')) {
                row.remove();
                tampilkanNotifikasi(
                    'Baris dihapus dari tampilan, database tidak berubah.',
                    'simulasi'
                );
            }
        });

        kolomAksi.append(editButton, nonaktifButton, hapusButton);
    }

    function buatBarisLayanan(layanan) {
        const row = document.createElement('tr');
        row.dataset.serviceRow = 'true';
        row.dataset.idLayanan = layanan.id_layanan;

        const namaCell = document.createElement('td');
        namaCell.textContent = layanan.nama_layanan;

        const hargaCell = document.createElement('td');
        hargaCell.appendChild(
            buatInput('layanan-price-input', layanan.harga)
        );

        const hppCell = document.createElement('td');
        const nilaiHpp = Object.prototype.hasOwnProperty.call(
            hppSementara,
            layanan.nama_layanan
        ) ? hppSementara[layanan.nama_layanan] : 0;

        hppCell.appendChild(
            buatInput('layanan-hpp-input', nilaiHpp)
        );

        const statusCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'layanan-checkbox';

        // Status aktif belum tersedia dalam respons GET API.
        // Nilai ini hanya tampilan sementara.
        checkbox.checked = true;
        statusCell.appendChild(checkbox);

        const aksiCell = document.createElement('td');
        aksiCell.className = 'layanan-aksi';

        row.append(namaCell, hargaCell, hppCell, statusCell, aksiCell);

        // Perubahan HPP tidak dikirim ke API.
      const inputHpp = row.querySelector('.layanan-hpp-input');

inputHpp.addEventListener('change', function () {
    const nama = namaCell.textContent.trim();
    const nilaiHpp = Number(this.value);

    if (this.value.trim() === '' || !Number.isFinite(nilaiHpp) || nilaiHpp < 0) {
        tampilkanNotifikasi('HPP tidak boleh kosong atau negatif.', 'gagal');
        return;
    }

    hppSementara[nama] = nilaiHpp;

    tampilkanNotifikasi(
        'HPP berhasil diubah sementara. Belum tersimpan ke database.',
        'simulasi'
    );

    console.log('HPP simulasi diperbarui:', nama, nilaiHpp);
});

        siapkanBaris(row);
        return row;
    }

    async function muatLayanan() {
        try {
            const response = await fetch(API_LAYANAN);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }

            const hasil = await response.json();

            if (!hasil.success || !Array.isArray(hasil.data)) {
                throw new Error('Format respons API tidak sesuai.');
            }

            tableBody.innerHTML = '';

            hasil.data.forEach(function (layanan) {
                tableBody.appendChild(buatBarisLayanan(layanan));
            });

            console.log('Layanan berhasil dimuat dari API:', hasil.data);
        } catch (error) {
            console.error('Gagal memuat layanan:', error);
            tampilkanNotifikasi(
                'Gagal mengambil layanan dari API. Periksa koneksi backend.',
                'gagal'
            );
        }
    }

    if (tableBody) {
        tableBody.addEventListener('change', function (event) {
            if (!event.target.matches('.layanan-checkbox')) return;

            tampilkanNotifikasi(
                'Status berubah pada tampilan saja, belum tersimpan ke database.',
                'simulasi'
            );
        });
    }

    if (form && tableBody) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            hapusError();

            const nama = namaInput.value.trim();
            const harga = hargaInput.value.trim();
            const hpp = hppInput.value.trim();

            let valid = true;

            if (!nama) {
                document.getElementById('errorNamaLayanan').textContent =
                    'Nama wajib diisi.';
                valid = false;
            }

            if (harga === '' || !Number.isFinite(Number(harga)) ||
                Number(harga) <= 0) {
                document.getElementById('errorHargaLayanan').textContent =
                    'Harga harus lebih dari nol.';
                valid = false;
            }

            if (hpp === '' || !Number.isFinite(Number(hpp)) ||
                Number(hpp) < 0) {
                document.getElementById('errorHppLayanan').textContent =
                    'HPP tidak boleh kosong atau negatif.';
                valid = false;
            }

            if (!valid) return;

            const namaDuplikat = Array.from(
                tableBody.querySelectorAll('tr[data-service-row]')
            ).some(function (row) {
                return row.cells[0].textContent.trim().toLowerCase() ===
                    nama.toLowerCase();
            });

            if (namaDuplikat) {
                document.getElementById('errorNamaLayanan').textContent =
                    'Nama layanan sudah ada.';
                return;
            }

            // Penambahan hanya simulasi frontend, belum dikirim ke API.
            const layananBaru = {
                id_layanan: 'sementara-' + Date.now(),
                nama_layanan: nama,
                harga: Number(harga)
            };

            hppSementara[nama] = Number(hpp);
            tableBody.appendChild(buatBarisLayanan(layananBaru));

            form.reset();

            tampilkanNotifikasi(
                'Layanan ditambahkan pada tampilan sementara, belum tersimpan ke database.',
                'simulasi'
            );
        });
    }

    muatLayanan();
});