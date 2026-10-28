document.addEventListener('DOMContentLoaded', function () {
    const tanggalInput = document.getElementById('tanggalPemasukan');
    const totalElement = document.getElementById('totalPemasukan');
    const statusElement = document.getElementById('statusPemasukan');
    const tabelWrapper = document.getElementById('tabelPemasukanWrapper');
    const tabelBody = document.getElementById('tabelPemasukanBody');
    const filterTanggal = document.getElementById('filterTanggalPemasukan');
    const tombolPeriode = document.querySelectorAll('.periode-pemasukan-btn');

    if (!tanggalInput || !totalElement || !statusElement || !tabelBody) return;

    let periodeAktif = 'hari';

    const formatTanggal = (date) => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');

    const sekarang = new Date();
    tanggalInput.value = formatTanggal(sekarang);

    function formatRupiah(nominal) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', maximumFractionDigits: 0
        }).format(nominal);
    }

    function tanggalPeriode() {
        const hari = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
        if (periodeAktif === 'bulan') {
            return formatTanggal(hari);
        }
        return formatTanggal(hari);
    }

    function rentangTanggal() {
        const hari = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
        if (periodeAktif === 'minggu') {
            const hariIndeks = (hari.getDay() + 6) % 7;
            const awal = new Date(hari);
            awal.setDate(hari.getDate() - hariIndeks);
            const hasil = [];
            for (let i = 0; i < 7 && awal <= hari; i += 1) {
                hasil.push(formatTanggal(awal));
                awal.setDate(awal.getDate() + 1);
            }
            return hasil;
        }
        if (periodeAktif === 'bulan') {
            const hasil = [];
            for (let i = 1; i <= hari.getDate(); i += 1) {
                hasil.push(formatTanggal(new Date(hari.getFullYear(), hari.getMonth(), i)));
            }
            return hasil;
        }
        return [tanggalInput.value || formatTanggal(hari)];
    }

    async function muatMetrikDashboard(tanggal, totalPemasukan) {
        const elPelanggan = document.getElementById('dashPelangganHariIni');
        const elTransaksi = document.getElementById('dashTransaksiHariIni');
        const elLabaKotor = document.getElementById('dashLabaKotorHariIni');

        try {
            const response = await fetch('/KELOMPOK-5/api/transaksi/index.php?tanggal=' + encodeURIComponent(tanggal), {
                headers: { 'Accept': 'application/json' }, credentials: 'same-origin'
            });
            const result = await response.json();
            const transaksi = result.success && Array.isArray(result.data) ? result.data : [];
            if (elTransaksi) elTransaksi.textContent = String(transaksi.length);
            if (elPelanggan) {
                const pelanggan = new Set(transaksi.map(item => item.id_pelanggan || item.nama_pelanggan).filter(Boolean));
                elPelanggan.textContent = String(pelanggan.size);
            }
            if (elLabaKotor) {
                const pengeluaranResponse = await fetch('/KELOMPOK-5/api/pengeluaran/index.php?tanggal=' + encodeURIComponent(tanggal), {
                    headers: { 'Accept': 'application/json' }, credentials: 'same-origin'
                });
                const pengeluaranResult = await pengeluaranResponse.json();
                const pengeluaran = pengeluaranResult.success ? Number(pengeluaranResult.data?.total_pengeluaran || 0) : 0;
                elLabaKotor.textContent = formatRupiah(Math.max(0, totalPemasukan - pengeluaran));
            }
        } catch (error) {
            console.error('Gagal memuat metrik dashboard:', error);
        }
    }

    async function ambilRekap(tanggal) {
        const response = await fetch('/KELOMPOK-5/api/rekap/pemasukan.php?tanggal=' + encodeURIComponent(tanggal), {
            method: 'GET', credentials: 'same-origin', headers: { 'Accept': 'application/json' }
        });
        const hasil = await response.json();
        if (!response.ok || !hasil.success || !hasil.data) {
            throw new Error(hasil.message || 'Gagal memuat data pemasukan.');
        }
        if (!Array.isArray(hasil.data.rincian_per_barber)) {
            throw new Error('Format rincian pemasukan tidak sesuai.');
        }
        return hasil.data;
    }

    async function muatPemasukan() {
        statusElement.hidden = false;
        statusElement.textContent = 'Memuat data pemasukan...';
        tabelWrapper && (tabelWrapper.hidden = true);
        totalElement.textContent = formatRupiah(0);
        tabelBody.replaceChildren();

        try {
            const tanggalList = rentangTanggal();
            const rekapList = await Promise.all(tanggalList.map(ambilRekap));
            const total = rekapList.reduce((jumlah, data) => jumlah + (Number(data.total_pemasukan) || 0), 0);
            const rekapPerBarber = new Map();

            rekapList.forEach(data => {
                data.rincian_per_barber.forEach(barber => {
                    const nama = barber.nama_barber || 'Tidak diketahui';
                    rekapPerBarber.set(nama, (rekapPerBarber.get(nama) || 0) + (Number(barber.total_pemasukan) || 0));
                });
            });

            totalElement.textContent = formatRupiah(total);
            if (periodeAktif === 'hari') {
                const tanggalHariIni = tanggalList[0];
                document.getElementById('dashPendapatanHariIni').textContent = formatRupiah(total);
                await muatMetrikDashboard(tanggalHariIni, total);
            }

            if (rekapPerBarber.size === 0) {
                statusElement.textContent = 'Belum ada transaksi pada periode ini';
                return;
            }

            Array.from(rekapPerBarber.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([nama, nominal]) => {
                const baris = document.createElement('tr');
                const namaCell = document.createElement('td');
                const totalCell = document.createElement('td');
                namaCell.textContent = nama;
                totalCell.textContent = formatRupiah(nominal);
                baris.append(namaCell, totalCell);
                tabelBody.appendChild(baris);
            });

            statusElement.hidden = true;
            tabelWrapper && (tabelWrapper.hidden = false);
        } catch (error) {
            console.error('Gagal memuat pemasukan:', error);
            statusElement.textContent = 'Pemasukan gagal dimuat. Silakan coba lagi.';
        }
    }

    tombolPeriode.forEach(tombol => {
        tombol.addEventListener('click', function () {
            periodeAktif = tombol.dataset.period;
            tombolPeriode.forEach(item => {
                const aktif = item === tombol;
                item.classList.toggle('active', aktif);
                item.setAttribute('aria-pressed', String(aktif));
            });
            if (filterTanggal) filterTanggal.hidden = periodeAktif !== 'hari';
            muatPemasukan();
        });
    });

    tanggalInput.addEventListener('change', muatPemasukan);
    muatPemasukan();
});
