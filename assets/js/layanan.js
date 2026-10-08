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

        if (tableBody.children.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="layanan-empty">
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
            if (
                hppLayanan.value === '' ||
                Number(hppLayanan.value) < 0
            ) {
                errorHppLayanan.textContent = 'HPP tidak boleh negatif';
                hppLayanan.classList.add('is-invalid');
                valid = false;
            }


            if (!valid) {
                return;
            }


            // Tambahkan baris ke tabel
            const tableBody = document.getElementById('layananTableBody');
            const emptyRow = tableBody.querySelector('.layanan-empty');

            if (emptyRow) {
                emptyRow.closest('tr').remove();
            }
            const row = document.createElement('tr');

row.innerHTML = `
    <td>${namaLayanan.value.trim()}</td>

    <td>
        <input
            type="number"
            class="layanan-price-input"
            value="${hargaLayanan.value}"
        >
    </td>

    <td>
        <input
            type="number"
            class="layanan-hpp-input"
            value="${hppLayanan.value}"
        >
    </td>

    <td>
        <input
            type="checkbox"
            class="layanan-checkbox"
            checked
        >
    </td>    
`;

            tableBody.appendChild(row);


            // Reset form
            formTambahLayanan.reset();

            // Notifikasi
            showSuccessNotification('Berhasil Ditambahkan');
        });
    }
showEmptyState();
});