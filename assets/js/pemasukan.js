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

        if (tabelWrapper) {
            tabelWrapper.hidden = true;
        }

        totalElement.textContent = formatRupiah(0);
        tabelBody.replaceChildren();

        try {
            const tanggalDipilih = tanggalInput.value;

            const response = await fetch(
                '/KELOMPOK-5/api/rekap/pemasukan.php?tanggal=' +
                encodeURIComponent(tanggalDipilih),
                {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            const hasil = await response.json();

            if (!response.ok || !hasil.success || !hasil.data) {
                throw new Error(
                    hasil.message || 'Gagal memuat data pemasukan.'
                );
            }

            const data = hasil.data;
            const rincianBarber = data.rincian_per_barber;

            if (!Array.isArray(rincianBarber)) {
                throw new Error('Format rincian pemasukan tidak sesuai.');
            }

            // Gunakan total yang dihitung oleh API backend.
            totalElement.textContent = formatRupiah(
                Number(data.total_pemasukan) || 0
            );

            if (rincianBarber.length === 0) {
                statusElement.textContent =
                    'Belum ada transaksi pada tanggal ini';
                return;
            }

            // Tampilkan pemasukan masing-masing barber.
            rincianBarber.forEach(function (barber) {
                const baris = document.createElement('tr');
                const namaCell = document.createElement('td');
                const totalCell = document.createElement('td');

                namaCell.textContent =
                    barber.nama_barber || 'Tidak diketahui';

                totalCell.textContent = formatRupiah(
                    Number(barber.total_pemasukan) || 0
                );

                baris.append(namaCell, totalCell);
                tabelBody.appendChild(baris);
            });

            statusElement.hidden = true;

            if (tabelWrapper) {
                tabelWrapper.hidden = false;
            }
        } catch (error) {
            console.error('Gagal memuat pemasukan:', error);

            statusElement.textContent =
                'Pemasukan gagal dimuat. Silakan coba lagi.';
        }
    }

    tanggalInput.addEventListener('change', muatPemasukan);
    muatPemasukan();
});
