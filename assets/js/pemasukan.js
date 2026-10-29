
document.addEventListener('DOMContentLoaded', function () {
    const API_URL = '/KELOMPOK-5/api/rekap/pemasukan.php';

    const tanggalInput = document.getElementById('tanggalPemasukan');
    const totalElement = document.getElementById('totalPemasukan');
    const statusElement = document.getElementById('statusPemasukan');
    const tabelWrapper = document.getElementById('tabelPemasukanWrapper');
    const tabelBody = document.getElementById('tabelPemasukanBody');

    if (!tanggalInput || !totalElement || !statusElement || !tabelBody) {
        console.error('Elemen halaman pemasukan belum lengkap.');
        return;
    }

    function tanggalLokal() {
        const sekarang = new Date();
        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
        const hari = String(sekarang.getDate()).padStart(2, '0');

        return `${tahun}-${bulan}-${hari}`;
    }

    function formatRupiah(nominal) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(nominal) || 0);
    }

    function buatSel(teks) {
        const sel = document.createElement('td');
        sel.textContent = teks;
        return sel;
    }

    async function muatPemasukan() {
        statusElement.hidden = false;
        statusElement.textContent = 'Memuat data pemasukan...';
        tabelWrapper.hidden = true;
        totalElement.textContent = formatRupiah(0);
        tabelBody.replaceChildren();

        try {
            const tanggal = tanggalInput.value || tanggalLokal();

            const response = await fetch(
                `${API_URL}?tanggal=${encodeURIComponent(tanggal)}`,
                {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            const hasil = await response.json();

            if (!response.ok || hasil.success !== true || !hasil.data) {
                throw new Error(
                    hasil.message || 'Gagal memuat data pemasukan.'
                );
            }

            const data = hasil.data;
            const rincian = Array.isArray(data.rincian_per_barber)
                ? data.rincian_per_barber
                : [];

            totalElement.textContent = formatRupiah(data.total_pemasukan);

            // Perbarui angka pemasukan dashboard jika elemennya tersedia.
            const dashPendapatan = document.getElementById('dashPendapatanHariIni');
            if (dashPendapatan && tanggal === tanggalLokal()) {
                dashPendapatan.textContent = formatRupiah(data.total_pemasukan);
            }

            if (rincian.length === 0) {
                statusElement.textContent = 'Belum ada transaksi pada tanggal ini.';
                return;
            }

           // Kosongkan tabel sebelum menampilkan data terbaru.
            tabelBody.replaceChildren();

            rincian.forEach((barber) => {
                const baris = document.createElement('tr');

                baris.append(
                    buatSel(barber.nama_barber || 'Tidak diketahui'),
                    buatSel(String(Number(barber.jumlah_transaksi) || 0)),
                    buatSel(formatRupiah(barber.total_pemasukan))
                );

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

    tanggalInput.value = tanggalLokal();
    tanggalInput.addEventListener('change', muatPemasukan);

    muatPemasukan();
});
