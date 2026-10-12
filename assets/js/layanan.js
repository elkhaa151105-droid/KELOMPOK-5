document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formTambahLayanan');
    const namaInput = document.getElementById('namaLayanan');
    const hargaInput = document.getElementById('hargaLayanan');
    const hppInput = document.getElementById('hppLayanan');
    const tableBody = document.getElementById('layananTableBody');

    
    // Menampilkan notifikasi sederhana
    function notifikasi(pesan) {
        alert(pesan);
    }


let timerNotifikasi;

function tampilkanNotifikasi(pesan, jenis) {
    const elemen = document.getElementById('layananNotifikasi');

    if (!elemen) {
        console.error('Elemen #layananNotifikasi tidak ditemukan');
        return;
    }

    clearTimeout(timerNotifikasi);

    elemen.textContent = pesan;
    elemen.className = 'layanan-notifikasi ' + jenis;

    timerNotifikasi = setTimeout(function () {
        elemen.textContent = '';
        elemen.className = 'layanan-notifikasi';
    }, 3000);
}


    // Menghapus pesan error pada form
    function hapusError() {
        document.getElementById('errorNamaLayanan').textContent = '';
        document.getElementById('errorHargaLayanan').textContent = '';
        document.getElementById('errorHppLayanan').textContent = '';
    }

    // Membuat tombol Edit dan Nonaktifkan pada setiap baris
    function siapkanBaris(row) {
    let kolomAksi = row.querySelector('.layanan-aksi');

    if (!kolomAksi) {
        kolomAksi = document.createElement('td');
        kolomAksi.className = 'layanan-aksi';
        row.appendChild(kolomAksi);
    }

    // Tombol Edit
    if (!kolomAksi.querySelector('.layanan-edit-button')) {
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'layanan-edit-button';
        editButton.textContent = 'Edit';
        kolomAksi.appendChild(editButton);

        editButton.addEventListener('click', function () {
            const namaCell = row.cells[0];
            const harga = row.querySelector('.layanan-price-input');
            const hpp = row.querySelector('.layanan-hpp-input');

            const namaBaru = prompt('Nama layanan:', namaCell.textContent.trim());
            if (namaBaru === null) return;

            if (namaBaru.trim() === '') {
                alert('Nama layanan wajib diisi');
                return;
            }

            const hargaBaru = prompt('Harga layanan:', harga.value);
            if (hargaBaru === null) return;

            if (hargaBaru.trim() === '' || !Number.isFinite(Number(hargaBaru)) || Number(hargaBaru) <= 0) {
                alert('Harga harus lebih dari nol');
                return;
            }

            const hppBaru = prompt('HPP layanan:', hpp.value);
            if (hppBaru === null) return;

            if (hppBaru.trim() === '' || !Number.isFinite(Number(hppBaru)) || Number(hppBaru) < 0) {
                alert('HPP tidak boleh kosong atau negatif');
                return;
            }

            namaCell.textContent = namaBaru.trim();
            harga.value = Number(hargaBaru);
            hpp.value = Number(hppBaru);

            alert('Layanan berhasil diedit');
        });
    }

    // Tombol Nonaktifkan
    if (!kolomAksi.querySelector('.layanan-nonaktif-button')) {
        const nonaktifButton = document.createElement('button');
        nonaktifButton.type = 'button';
        nonaktifButton.className = 'layanan-nonaktif-button';
        nonaktifButton.textContent = 'Nonaktifkan';
        kolomAksi.appendChild(nonaktifButton);

        nonaktifButton.addEventListener('click', function () {
            const checkbox = row.querySelector('.layanan-checkbox');

            if (!checkbox) return;

            if (!checkbox.checked) {
                alert('Layanan sudah nonaktif');
                return;
            }

            if (confirm('Nonaktifkan layanan ini?')) {
                checkbox.checked = false;
                alert('Layanan dinonaktifkan');
            }
        });
    }

    // Tombol Hapus
    if (!kolomAksi.querySelector('.layanan-hapus-button')) {
        const hapusButton = document.createElement('button');
        hapusButton.type = 'button';
        hapusButton.className = 'layanan-hapus-button';
        hapusButton.textContent = 'Hapus';
        kolomAksi.appendChild(hapusButton);

        hapusButton.addEventListener('click', function () {
            const nama = row.cells[0].textContent.trim();

        if (confirm('Yakin ingin menghapus layanan "' + nama + '"?')) {
        row.remove();
        tampilkanNotifikasi('Layanan berhasil dihapus!', 'dihapus');
        }
        });
    }
}

    // Menyiapkan baris layanan yang sudah tersedia
    if (tableBody) {
        tableBody.querySelectorAll('tr[data-service-row]').forEach(function (row) {
            siapkanBaris(row);
        });

        // Menampilkan notifikasi saat status checkbox berubah
        tableBody.addEventListener('change', function (event) {
            if (!event.target.matches('.layanan-checkbox')) return;

            notifikasi(
                event.target.checked
                    ? 'Layanan diaktifkan'
                    : 'Layanan dinonaktifkan'
            );
        });
    }

    // Menambahkan layanan baru ke tabel
    if (form && tableBody) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            hapusError();

            const nama = namaInput.value.trim();
            const harga = hargaInput.value.trim();
            const hpp = hppInput.value.trim();

            let valid = true;

            if (nama === '') {
                document.getElementById('errorNamaLayanan').textContent = 'Nama wajib diisi';
                valid = false;
            }

            if (harga === '' || !Number.isFinite(Number(harga)) || Number(harga) <= 0) {
                document.getElementById('errorHargaLayanan').textContent = 'Harga harus lebih dari nol';
                valid = false;
            }

            if (hpp === '' || !Number.isFinite(Number(hpp)) || Number(hpp) < 0) {
                document.getElementById('errorHppLayanan').textContent = 'HPP tidak boleh kosong atau negatif';
                valid = false;
            }

            if (!valid) return;

            // Mencegah nama layanan yang sama
            const namaSama = Array.from(
                tableBody.querySelectorAll('tr[data-service-row] td:first-child')
            ).some(function (cell) {
                return cell.textContent.trim().toLowerCase() === nama.toLowerCase();
            });

            if (namaSama) {
                document.getElementById('errorNamaLayanan').textContent = 'Nama layanan sudah ada';
                return;
            }

            const row = document.createElement('tr');
            row.setAttribute('data-service-row', 'true');

            const namaCell = document.createElement('td');
            namaCell.textContent = nama;

            const hargaCell = document.createElement('td');
            const hargaBaru = document.createElement('input');
            hargaBaru.type = 'number';
            hargaBaru.className = 'layanan-price-input';
            hargaBaru.value = Number(harga);
            hargaCell.appendChild(hargaBaru);

            const hppCell = document.createElement('td');
            const hppBaru = document.createElement('input');
            hppBaru.type = 'number';
            hppBaru.className = 'layanan-hpp-input';
            hppBaru.value = Number(hpp);
            hppCell.appendChild(hppBaru);

            const statusCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'layanan-checkbox';
            checkbox.checked = true;
            statusCell.appendChild(checkbox);

            row.append(namaCell, hargaCell, hppCell, statusCell);
            tableBody.appendChild(row);

            siapkanBaris(row);

            form.reset();
tampilkanNotifikasi('Layanan berhasil ditambahkan!', 'berhasil');
        });
    }
});
