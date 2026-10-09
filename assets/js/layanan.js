document.addEventListener('DOMContentLoaded', function () {

    const formTambahLayanan = document.getElementById('formTambahLayanan');
    const namaLayanan = document.getElementById('namaLayanan');
    const hargaLayanan = document.getElementById('hargaLayanan');
    const hppLayanan = document.getElementById('hppLayanan');

    const errorNamaLayanan = document.getElementById('errorNamaLayanan');
    const errorHargaLayanan = document.getElementById('errorHargaLayanan');
    const errorHppLayanan = document.getElementById('errorHppLayanan');


    // Format harga ke Rupiah
    function formatRupiah(value) {
        return 'Rp' + Number(value).toLocaleString('id-ID');
    }
    // Tampilkan kondisi jika belum ada layanan
   
function showEmptyState() {
    const tableBody = document.getElementById('layananTableBody');

    if (!tableBody) return;

    // Periksa apakah tabel memiliki baris layanan.
    const serviceRows = tableBody.querySelectorAll('tr[data-service-row]');

    // Jika belum ada layanan, tampilkan pesan kosong.
    if (serviceRows.length === 0) {
        tableBody.innerHTML = `
            <tr class="layanan-empty-row">
                <td colspan="5" class="layanan-empty">
                    Belum ada layanan.
                </td>
            </tr>
        `;
    }
}

    // Notifikasi berhasil
    function showSuccessNotification(message) {
        const notification = document.createElement('div');

        notification.className = 'transaction-success';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');

            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2500);
    }


    // Tambah layanan
    if (formTambahLayanan) {
        formTambahLayanan.addEventListener('submit', function (e) {
            e.preventDefault();

            let valid = true;

            errorNamaLayanan.textContent = '';
            errorHargaLayanan.textContent = '';
            errorHppLayanan.textContent = '';

            namaLayanan.classList.remove('is-invalid');
            hargaLayanan.classList.remove('is-invalid');
            hppLayanan.classList.remove('is-invalid');


            // Validasi nama
            if (namaLayanan.value.trim() === '') {
                errorNamaLayanan.textContent = 'Nama layanan wajib diisi';
                namaLayanan.classList.add('is-invalid');
                valid = false;
            }


            // Validasi harga
            if (
                hargaLayanan.value === '' ||
                Number(hargaLayanan.value) <= 0
            ) {
                errorHargaLayanan.textContent = 'Harga harus lebih dari nol';
                hargaLayanan.classList.add('is-invalid');
                valid = false;
            }


        // Validasi HPP
if (hppLayanan.value.trim() === '') {
    errorHppLayanan.textContent = 'HPP wajib diisi';
    hppLayanan.classList.add('is-invalid');
    valid = false;
} else if (
    !Number.isFinite(Number(hppLayanan.value)) ||
    Number(hppLayanan.value) < 0
) {
    errorHppLayanan.textContent = 'HPP tidak boleh negatif dan harus berupa angka';
    hppLayanan.classList.add('is-invalid');
    valid = false;
}

if (!valid) {
    return;
}

const tableBody = document.getElementById('layananTableBody');

if (!tableBody) return;

// Hapus pesan kosong jika ada.
const emptyRow = tableBody.querySelector('.layanan-empty-row');

if (emptyRow) {
    emptyRow.remove();

}

// Buat baris baru.
const row = document.createElement('tr');
row.dataset.serviceRow = 'true';

// Kolom nama layanan.
const namaCell = document.createElement('td');
namaCell.textContent = namaLayanan.value.trim();
row.appendChild(namaCell);

// Kolom harga.
const hargaCell = document.createElement('td');
const hargaInput = document.createElement('input');
hargaInput.type = 'number';
hargaInput.className = 'layanan-price-input';
hargaInput.value = hargaLayanan.value;
hargaCell.appendChild(hargaInput);
row.appendChild(hargaCell);

// Kolom HPP.
const hppCell = document.createElement('td');
const hppInput = document.createElement('input');
hppInput.type = 'number';
hppInput.className = 'layanan-hpp-input';
hppInput.value = hppLayanan.value;
hppCell.appendChild(hppInput);
row.appendChild(hppCell);

// Kolom status aktif.
const statusCell = document.createElement('td');
const statusCheckbox = document.createElement('input');

statusCheckbox.type = 'checkbox';
statusCheckbox.className = 'layanan-checkbox';
statusCheckbox.checked = true;

statusCell.appendChild(statusCheckbox);
row.appendChild(statusCell);

// Ubah tampilan saat status layanan berubah.
statusCheckbox.addEventListener('change', function () {
    if (statusCheckbox.checked) {
        showSuccessNotification('Layanan Diaktifkan');
    } else {
        showSuccessNotification('Layanan Dinonaktifkan');
    }
});

// Kolom aksi untuk tombol Edit.
const aksiCell = document.createElement('td');

const editButton = document.createElement('button');
editButton.type = 'button';
editButton.textContent = 'Edit';
editButton.className = 'layanan-edit-button';

aksiCell.appendChild(editButton);
row.appendChild(aksiCell);

// Masukkan baris ke tabel setelah semua kolom selesai dibuat.
tableBody.appendChild(row);

            // Reset form
            formTambahLayanan.reset();

            // Notifikasi
            showSuccessNotification('Berhasil Ditambahkan');
            // Fungsi tombol Edit.


// Fungsi Edit layanan baru.
editButton.addEventListener('click', function () {
    const namaCell = row.cells[0];
    const hargaCell = row.cells[1];
    const hppCell = row.cells[2];

    const namaBaru = prompt(
        'Masukkan nama layanan:',
        namaCell.textContent.trim()
    );

    if (namaBaru === null) return;

    if (namaBaru.trim() === '') {
        alert('Nama layanan wajib diisi');
        return;
    }

    const hargaInput = hargaCell.querySelector('input');
    const hppInput = hppCell.querySelector('input');

    const hargaBaru = prompt(
        'Masukkan harga layanan:',
        hargaInput.value
    );

    if (hargaBaru === null) return;

    if (
        hargaBaru.trim() === '' ||
        !Number.isFinite(Number(hargaBaru)) ||
        Number(hargaBaru) <= 0
    ) {
        alert('Harga harus lebih dari nol');
        return;
    }

    const hppBaru = prompt(
        'Masukkan HPP layanan:',
        hppInput.value
    );

    if (hppBaru === null) return;

    if (
        hppBaru.trim() === '' ||
        !Number.isFinite(Number(hppBaru)) ||
        Number(hppBaru) < 0
    ) {
        alert('HPP wajib diisi dan tidak boleh negatif');
        return;
    }

    namaCell.textContent = namaBaru.trim();
    hargaInput.value = Number(hargaBaru);
    hppInput.value = Number(hppBaru);

    showSuccessNotification('Layanan Berhasil Diedit');
});


        });
    }
    // Tambahkan tombol Edit pada layanan yang sudah ada.
const tableBody = document.getElementById('layananTableBody');

if (tableBody) {
    const serviceRows = tableBody.querySelectorAll('tr[data-service-row]');

    serviceRows.forEach(function (row) {
        // Ambil checkbox status layanan.
        const statusCheckbox = row.querySelector('.layanan-checkbox');

        // Notifikasi saat status layanan berubah.
        if (statusCheckbox) {
            statusCheckbox.addEventListener('change', function () {
                if (statusCheckbox.checked) {
                    showSuccessNotification('Layanan Diaktifkan');
                } else {
                    showSuccessNotification('Layanan Dinonaktifkan');
                }
            });
        }

       

        // Cari tombol Edit yang sudah tersedia.
        let editButton = row.querySelector('.layanan-edit-button');

        // Jika belum ada, buat tombol Edit baru.
        if (!editButton) {
            const aksiCell = document.createElement('td');

            editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.textContent = 'Edit';
            editButton.className = 'layanan-edit-button';

            aksiCell.appendChild(editButton);
            row.appendChild(aksiCell);
        }

        // Fungsi Edit layanan yang sudah ada.
        editButton.addEventListener('click', function () {
            const namaCell = row.cells[0];
            const hargaCell = row.cells[1];
            const hppCell = row.cells[2];

            const namaInput = namaCell;
            const hargaInput = hargaCell.querySelector('input');
            const hppInput = hppCell.querySelector('input');

            // Pastikan input harga dan HPP tersedia.
            if (!hargaInput || !hppInput) {
                alert('Input harga atau HPP tidak ditemukan');
                return;
            }

            // Minta nama baru.
            const namaBaru = prompt(
                'Masukkan nama layanan:',
                namaInput.textContent.trim()
            );

            if (namaBaru === null) return;

            if (namaBaru.trim() === '') {
                alert('Nama layanan wajib diisi');
                return;
            }

            // Minta harga baru.
            const hargaBaru = prompt(
                'Masukkan harga layanan:',
                hargaInput.value
            );

            if (hargaBaru === null) return;

            if (
                hargaBaru.trim() === '' ||
                !Number.isFinite(Number(hargaBaru)) ||
                Number(hargaBaru) <= 0
            ) {
                alert('Harga harus lebih dari nol');
                return;
            }

            // Minta HPP baru.
            const hppBaru = prompt(
                'Masukkan HPP layanan:',
                hppInput.value
            );

            if (hppBaru === null) return;

            if (
                hppBaru.trim() === '' ||
                !Number.isFinite(Number(hppBaru)) ||
                Number(hppBaru) < 0
            ) {
                alert('HPP wajib diisi dan tidak boleh negatif');
                return;
            }

            // Simpan semua perubahan setelah validasi berhasil.
            namaInput.textContent = namaBaru.trim();
            hargaInput.value = Number(hargaBaru);
            hppInput.value = Number(hppBaru);

            showSuccessNotification('Layanan Berhasil Diedit');
        });
    });
}


// Validasi HPP saat diedit langsung di tabel.
const tableBodyHpp = document.getElementById('layananTableBody');

if (tableBodyHpp) {
    tableBodyHpp.addEventListener('change', function (event) {
        const input = event.target;

        // Jalankan hanya untuk input HPP.
        if (!input.matches('.layanan-hpp-input')) return;

        // Tolak nilai kosong atau negatif.
        if (input.value.trim() === '' || Number(input.value) < 0) {
            alert('HPP tidak boleh kosong atau negatif');

            input.value = '';
            input.focus();
        }
    });
}



// Periksa apakah tabel layanan kosong.
showEmptyState();
});
