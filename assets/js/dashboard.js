/**
 * Kataji Barber - Dashboard
 * Frontend dashboard summary and trend chart.
 */
document.addEventListener('DOMContentLoaded', function () {
    const rekapUrl = '/KELOMPOK-5/api/rekap/pemasukan.php';
    const trenUrl = '/KELOMPOK-5/api/rekap/tren.php';

    if (!document.getElementById('dashboardLineChart') &&
        !document.getElementById('dashTransaksiHariIni')) {
        return;
    }

    function tanggalLokal() {
        const sekarang = new Date();
        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
        const hari = String(sekarang.getDate()).padStart(2, '0');
        return `${tahun}-${bulan}-${hari}`;
    }

    function formatRupiah(nilai) {
        return 'Rp' + Number(nilai || 0).toLocaleString('id-ID', {
            maximumFractionDigits: 0
        });
    }

    function formatNilaiSumbu(nilai) {
        if (nilai >= 1000000) return 'Rp' + (nilai / 1000000).toFixed(nilai % 1000000 === 0 ? 0 : 1) + ' jt';
        if (nilai >= 1000) return 'Rp' + Math.round(nilai / 1000) + 'K';
        return 'Rp' + nilai;
    }

    async function muatRingkasanHariIni() {
        const transaksiElement = document.getElementById('dashTransaksiHariIni');
        const pendapatanElement = document.getElementById('dashPendapatanHariIni');
        const donutJumlah = document.getElementById('dashboardJumlahTransaksi');

        try {
            const response = await fetch(`${rekapUrl}?periode=hari&tanggal=${tanggalLokal()}`, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' }
            });
            const hasil = await response.json();
            if (!response.ok || hasil.success !== true) throw new Error(hasil.message || 'Ringkasan gagal dimuat.');

            const data = hasil.data || {};
            const jumlah = Number(data.jumlah_transaksi || 0);
            const pemasukan = Number(data.total_pemasukan || 0);

            if (transaksiElement) transaksiElement.textContent = String(jumlah);
            if (pendapatanElement) pendapatanElement.textContent = formatRupiah(pemasukan);
            if (donutJumlah) donutJumlah.textContent = String(jumlah);
            const donut = document.querySelector('.payment-donut');
            if (donut) {
                donut.classList.toggle('is-empty', jumlah === 0);
            }
        } catch (error) {
            console.error('Gagal memuat ringkasan Dashboard:', error);
        }
    }

    async function muatGrafikTujuhHari() {
        const container = document.getElementById('dashboardLineChart');
        if (!container) return;

        try {
            const response = await fetch(`${trenUrl}?periode=7_hari`, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' }
            });
            const hasil = await response.json();
            if (!response.ok || hasil.success !== true) throw new Error(hasil.message || 'Grafik gagal dimuat.');

            const labels = Array.isArray(hasil.data.labels) ? hasil.data.labels : [];
            const nilai = Array.isArray(hasil.data.pemasukan) ? hasil.data.pemasukan.map(Number) : [];
            tampilkanGrafik(container, labels, nilai);
        } catch (error) {
            console.error('Gagal memuat grafik pemasukan:', error);
            container.textContent = 'Grafik pemasukan gagal dimuat.';
        }
    }

    function tampilkanGrafik(container, labels, nilai) {
        const lebar = 560;
        const kiri = 58;
        const kanan = 540;
        const atas = 20;
        const bawah = 145;
        const maksimum = Math.max(...nilai, 0);
        const batas = maksimum > 0 ? maksimum * 1.2 : 1000;
        const rentang = Math.max(kanan - kiri, 1);
        const jarak = rentang / Math.max(labels.length - 1, 1);

        const titik = nilai.map(function (jumlah, index) {
            const x = labels.length === 1 ? kiri : kiri + (jarak * index);
            const y = bawah - ((jumlah / batas) * (bawah - atas));
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });

        const garisY = [atas, atas + ((bawah - atas) * 0.33), atas + ((bawah - atas) * 0.66), bawah];
        const labelsSumbu = labels.map(function (label, index) {
            const namaPendek = String(label).slice(0, 3);
            const x = labels.length === 1 ? kiri : kiri + (jarak * index);
            return `<text x="${x.toFixed(1)}" y="174" text-anchor="middle">${namaPendek}</text>`;
        }).join('');

        const garisGrid = garisY.map(function (y, index) {
            const nilaiSumbu = batas - ((batas / 3) * index);
            return `<line x1="${kiri}" y1="${y}" x2="${kanan}" y2="${y}"></line>
                    <text x="4" y="${y + 4}" class="chart-axis-label">${formatNilaiSumbu(nilaiSumbu)}</text>`;
        }).join('');

        const titikLingkaran = titik.map(function (nilaiTitik) {
            const [cx, cy] = nilaiTitik.split(',');
            return `<circle cx="${cx}" cy="${cy}" r="4"></circle>`;
        }).join('');

        container.innerHTML = `
            <svg viewBox="0 0 560 190" role="img" aria-label="Grafik pemasukan tujuh hari terakhir">
                <g class="chart-grid-lines">${garisGrid}</g>
                <polyline class="chart-line-shadow" points="${titik.join(' ')}"></polyline>
                <polyline class="chart-line" points="${titik.join(' ')}"></polyline>
                <g class="chart-point-list">${titikLingkaran}</g>
                <g class="chart-labels">${labelsSumbu}</g>
            </svg>`;
    }

    muatRingkasanHariIni();
    muatGrafikTujuhHari();
});
