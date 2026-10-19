
document.addEventListener('DOMContentLoaded', function () {
    const tanggalInput = document.getElementById('tanggalPemasukan');
    const totalElement = document.getElementById('totalPemasukan');
    const statusElement = document.getElementById('statusPemasukan');
    const tabelWrapper = document.getElementById('tabelPemasukanWrapper');
    const tabelBody = document.getElementById('tabelPemasukanBody');

    if (!tanggalInput || !totalElement || !statusElement || !tabelBody) {
        return;
    }

    // Gunakan tanggal lokal browser, bukan UTC.
    const sekarang = new Date();
    tanggalInput.value = [
        sekarang.getFullYear(),
        String(sekarang.getMonth() + 1).padStart(2, '0'),
        String(sekarang.getDate()).padStart(2, '0')
    ].join('-');

    function formatRupiah(nominal) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(nominal);
    }

    async function muatPemasukan() {
        statusElement.textContent = 'Memuat data pemasukan...';
        statusElement.hidden = false;
        tabelWrapper.hidden = true;
        totalElement.textContent = formatRupiah(0);
        tabelBody.replaceChildren();

        try {
            const response = await fetch('/KELOMPOK-5/api/transaksi/index.php', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success || !Array.isArray(hasil.data)) {
                throw new Error(hasil.message || 'Gagal memuat transaksi.');
            }

            const tanggalDipilih = tanggalInput.value;

            const transaksiHarian = hasil.data.filter(function (transaksi) {
                return String(transaksi.tanggal).slice(0, 10) === tanggalDipilih;
            });

            if (transaksiHarian.length === 0) {
                statusElement.textContent = 'Belum ada transaksi pada tanggal ini';
                return;
            }

            const pemasukanPerBarber = new Map();
            let total = 0;

            transaksiHarian.forEach(function (transaksi) {
                const namaBarber = transaksi.nama_barber || 'Tidak diketahui';
                const nominal = Number(transaksi.total_harga) || 0;

                total += nominal;
                pemasukanPerBarber.set(
                    namaBarber,
                    (pemasukanPerBarber.get(namaBarber) || 0) + nominal
                );
            });

            totalElement.textContent = formatRupiah(total);

            pemasukanPerBarber.forEach(function (nominal, nama) {
                const baris = document.createElement('tr');
                const namaCell = document.createElement('td');
                const totalCell = document.createElement('td');

                namaCell.textContent = nama;
                totalCell.textContent = formatRupiah(nominal);

                baris.append(namaCell, totalCell);
                tabelBody.appendChild(baris);
            });

            statusElement.hidden = true;
            tabelWrapper.hidden = false;
        } catch (error) {
            console.error('Gagal memuat pemasukan:', error);
            statusElement.textContent =
                'Pemasukan gagal dimuat. Silakan coba lagi.';
        }
    }

    tanggalInput.addEventListener('change', muatPemasukan);
    muatPemasukan();
});
