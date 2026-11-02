/**
 * Kataji Barber - Dashboard
 * Semua nilai Dashboard diambil dari API rekap aktif.
 */
document.addEventListener('DOMContentLoaded', function () {
    const dashboardUrl = '/KELOMPOK-5/api/rekap/dashboard.php';
    const rekapUrl = '/KELOMPOK-5/api/rekap/pemasukan.php';
    const trenUrl = '/KELOMPOK-5/api/rekap/tren.php';

    // ========================================
    // BAGIAN: UTILITAS
    // ========================================
    function today() {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function rupiah(value) {
        return 'Rp' + Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
    }

    function escapeHtml(value) {
        const element = document.createElement('div');
        element.textContent = String(value ?? '');
        return element.innerHTML;
    }

    async function jsonApi(url) {
        const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error(result.message || 'Data Dashboard gagal dimuat.');
        return result.data;
    }

    // ========================================
    // BAGIAN: RINGKASAN HARIAN
    // ========================================
    async function loadDaily() {
        try {
            const data = await jsonApi(`${dashboardUrl}?periode=hari&tanggal=${today()}`);
            document.getElementById('dashPelangganHariIni').textContent = String(Number(data.jumlah_pelanggan || 0));
            document.getElementById('dashTransaksiHariIni').textContent = String(Number(data.jumlah_transaksi || 0));
            document.getElementById('dashPendapatanHariIni').textContent = rupiah(data.keuangan?.pemasukan || 0);
            document.getElementById('dashLabaKotorHariIni').textContent = rupiah(data.keuangan?.laba_kotor || 0);
            document.getElementById('dashboardJumlahTransaksi').textContent = String(Number(data.jumlah_transaksi || 0));
            renderPayments(data.pembayaran || []);
        } catch (error) {
            console.error(error);
        }
    }

    // ========================================
    // BAGIAN: REKAP KEUANGAN DAN PEMASUKAN PER BARBER
    // ========================================
    async function loadRevenue(period = 'minggu') {
        const status = document.getElementById('statusPemasukan');
        const wrapper = document.getElementById('tabelPemasukanWrapper');
        const body = document.getElementById('tabelPemasukanBody');

        try {
            if (period === 'semua') {
                const data = await jsonApi(`${dashboardUrl}?periode=semua&tanggal=${today()}`);
                document.getElementById('totalPemasukan').textContent = rupiah(data.keuangan.pemasukan);
                setFinancial(data.keuangan);
                status.textContent = 'Rincian pemasukan per barber untuk periode Semua belum tersedia pada API.';
                status.hidden = false;
                wrapper.hidden = true;
                body.replaceChildren();
                return;
            }

            const data = await jsonApi(`${rekapUrl}?periode=${encodeURIComponent(period)}&tanggal=${today()}`);
            document.getElementById('totalPemasukan').textContent = rupiah(data.total_pemasukan);
            const summary = await jsonApi(`${dashboardUrl}?periode=${encodeURIComponent(period)}&tanggal=${today()}`);
            setFinancial(summary.keuangan);

            const barber = Array.isArray(data.rincian_per_barber) ? data.rincian_per_barber : [];
            if (!data.ada_data || barber.length === 0) {
                status.textContent = 'Belum ada transaksi pada periode ini';
                status.hidden = false;
                wrapper.hidden = true;
                body.replaceChildren();
                return;
            }

            status.hidden = true;
            wrapper.hidden = false;
            body.innerHTML = barber.map(item => `<tr><td>${escapeHtml(item.nama_barber)}</td><td>${Number(item.jumlah_transaksi || 0)}</td><td>${rupiah(item.total_pemasukan)}</td></tr>`).join('');
        } catch (error) {
            status.hidden = false;
            status.textContent = 'Data pemasukan gagal dimuat.';
            console.error(error);
        }
    }

    function setFinancial(data) {
        document.getElementById('totalHpp').textContent = rupiah(data.hpp);
        document.getElementById('totalLabaKotor').textContent = rupiah(data.laba_kotor);
        document.getElementById('totalBiayaOperasional').textContent = rupiah(data.biaya_operasional);
        document.getElementById('totalLabaBersih').textContent = rupiah(data.laba_bersih);
    }

    // ========================================
    // BAGIAN: GRAFIK TREN PEMASUKAN
    // ========================================
    async function loadTrend(period = '7_hari') {
        const container = document.getElementById('dashboardLineChart');
        try {
            const data = await jsonApi(`${trenUrl}?periode=${encodeURIComponent(period)}`);
            const labels = Array.isArray(data.labels) ? data.labels : [];
            const values = Array.isArray(data.pemasukan) ? data.pemasukan.map(Number) : [];
            renderTrendSummary(data, period, labels, values);

            if (!values.length || values.every(value => value === 0)) {
                container.innerHTML = '<div class="chart-empty-state">Belum ada data untuk ditampilkan</div>';
                return;
            }
            renderChart(container, labels, values);
        } catch (error) {
            container.textContent = 'Grafik pemasukan gagal dimuat.';
            console.error(error);
        }
    }

    function renderTrendSummary(data, period, labels, values) {
        const status = String(data.status_tren || 'stabil');
        const percentage = Math.abs(Number(data.persentase_perubahan || 0)).toFixed(Number(data.persentase_perubahan || 0) % 1 === 0 ? 0 : 1);
        const statusText = `${status.charAt(0).toUpperCase()}${status.slice(1)} ${percentage}%`;
        const indicator = document.getElementById('trenPemasukanIndicator');
        indicator.textContent = statusText;
        indicator.className = `trend-indicator trend-${status}`;
        document.getElementById('trenStatusRingkas').textContent = statusText;
        document.getElementById('trenTotalAktif').textContent = rupiah(data.total_pemasukan);
        document.getElementById('trenPemasukanJudul').textContent = period === 'bulan' ? 'Pemasukan Per Bulan' : period === 'minggu' ? 'Pemasukan Per Minggu' : 'Pemasukan 7 Hari Terakhir';

        if (values.length) {
            const max = Math.max(...values);
            const index = values.indexOf(max);
            document.getElementById('trenHariTertinggi').textContent = rupiah(max);
            document.getElementById('trenHariTertinggiTanggal').textContent = labels[index] || 'Belum ada data';
        }
    }

    function renderChart(container, labels, values) {
        const left = 58;
        const right = 540;
        const top = 20;
        const bottom = 145;
        const maxValue = Math.max(...values, 0);
        const ceiling = maxValue * 1.2 || 1000;
        const step = (right - left) / Math.max(labels.length - 1, 1);
        const points = values.map((value, index) => {
            const x = labels.length === 1 ? left : left + step * index;
            const y = bottom - (value / ceiling) * (bottom - top);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        const grid = [top, top + (bottom - top) / 3, top + 2 * (bottom - top) / 3, bottom].map((y, index) => {
            const label = ceiling - (ceiling / 3) * index;
            return `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}"></line><text x="4" y="${y + 4}" class="chart-axis-label">Rp${Math.round(label / 1000)}K</text>`;
        }).join('');
        const circles = points.map((point, index) => {
            const [x, y] = point.split(',');
            return `<g class="chart-point" tabindex="0"><circle cx="${x}" cy="${y}" r="9" class="chart-hit-area"></circle><circle cx="${x}" cy="${y}" r="4" class="chart-dot"></circle><title>${escapeHtml(labels[index])}: ${rupiah(values[index])}</title></g>`;
        }).join('');
        const text = labels.map((label, index) => `<text x="${labels.length === 1 ? left : left + step * index}" y="174" text-anchor="middle">${escapeHtml(String(label).slice(0, 3))}</text>`).join('');
        container.innerHTML = `<svg viewBox="0 0 560 190" role="img" aria-label="Grafik tren pemasukan"><g class="chart-grid-lines">${grid}</g><polyline class="chart-line" points="${points.join(' ')}"></polyline><g class="chart-point-list">${circles}</g><g class="chart-labels">${text}</g></svg>`;
    }

    // ========================================
    // BAGIAN: DISTRIBUSI PEMBAYARAN
    // ========================================
    function renderPayments(items) {
        const amounts = {};
        items.forEach(item => amounts[item.metode] = item);
        ['cash', 'transfer', 'qris'].forEach(method => {
            const item = amounts[method] || {};
            const id = method === 'cash' ? 'legendCash' : method === 'transfer' ? 'legendTransfer' : 'legendQris';
            document.getElementById(id).textContent = `(${Number(item.jumlah_transaksi || 0)} trx) ${rupiah(item.total_pemasukan || 0)}`;
        });
        const cash = Number(amounts.cash?.jumlah_transaksi || 0);
        const transfer = Number(amounts.transfer?.jumlah_transaksi || 0);
        const qris = Number(amounts.qris?.jumlah_transaksi || 0);
        const total = cash + transfer + qris;
        const donut = document.querySelector('.payment-donut');
        if (!total) {
            donut.style.background = '#E9EAF2';
            return;
        }
        const pCash = cash / total * 100;
        const pTransfer = pCash + transfer / total * 100;
        donut.style.background = `conic-gradient(#17186B 0 ${pCash}%, #6C7DFF ${pCash}% ${pTransfer}%, #D8DAE8 ${pTransfer}% 100%)`;
    }

    // ========================================
    // BAGIAN: LAYANAN TERLARIS
    // ========================================
    async function loadServices(period = 'minggu', sort = 'terbanyak') {
        const container = document.querySelector('.layanan-populer-empty, .layanan-populer-list');
        try {
            const data = period === 'semua'
                ? await jsonApi(`${dashboardUrl}?periode=semua&tanggal=${today()}&limit=20`)
                : await jsonApi(`${dashboardUrl}?periode=${encodeURIComponent(period)}&tanggal=${today()}&limit=20`);
            let services = Array.isArray(data.layanan_populer) ? [...data.layanan_populer] : [];
            services.sort((a, b) => sort === 'terbanyak'
                ? Number(b.jumlah_terjual) - Number(a.jumlah_terjual)
                : Number(a.jumlah_terjual) - Number(b.jumlah_terjual));
            if (!services.length) {
                container.className = 'layanan-populer-empty';
                container.textContent = 'Belum ada data layanan pada periode ini';
                return;
            }
            const max = Math.max(...services.map(item => Number(item.jumlah_terjual || 0)), 1);
            container.className = 'layanan-populer-list';
            container.innerHTML = services.map((item, index) => {
                const count = Number(item.jumlah_terjual || 0);
                return `<div class="layanan-populer-item"><span class="layanan-rank">${index + 1}</span><span class="layanan-name">${escapeHtml(item.nama_layanan)}</span><div class="layanan-bar-track"><span style="width:${Math.max(count / max * 100, 3)}%"></span></div><strong>${count}</strong></div>`;
            }).join('');
        } catch (error) {
            container.className = 'layanan-populer-empty';
            container.textContent = 'Data layanan gagal dimuat.';
            console.error(error);
        }
    }

    document.querySelectorAll('.periode-pemasukan-btn').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('.periode-pemasukan-btn').forEach(item => {
            item.classList.toggle('active', item === button);
            item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        loadRevenue(button.dataset.period);
    }));
    document.getElementById('trenPemasukanPeriode').addEventListener('change', event => loadTrend(event.target.value));
    document.querySelectorAll('.layanan-period-btn').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('.layanan-period-btn').forEach(item => item.classList.toggle('active', item === button));
        loadServices(button.dataset.period, document.querySelector('.layanan-sort-btn').dataset.sort);
    }));
    document.querySelector('.layanan-sort-btn').addEventListener('click', function () {
        this.dataset.sort = this.dataset.sort === 'terbanyak' ? 'tersedikit' : 'terbanyak';
        this.textContent = this.dataset.sort === 'terbanyak' ? 'Paling Sering' : 'Paling Jarang';
        loadServices(document.querySelector('.layanan-period-btn.active').dataset.period, this.dataset.sort);
    });

    loadDaily();
    loadRevenue('minggu');
    loadTrend('7_hari');
    loadServices('minggu', 'terbanyak');

    window.addEventListener('focus', () => {
        loadDaily();
        loadRevenue(document.querySelector('.periode-pemasukan-btn.active')?.dataset.period || 'minggu');
        loadTrend(document.getElementById('trenPemasukanPeriode').value);
        loadServices(document.querySelector('.layanan-period-btn.active')?.dataset.period || 'minggu', document.querySelector('.layanan-sort-btn').dataset.sort);
    });

    window.addEventListener('storage', function (event) {
        if (event.key === 'kataji:data-changed') {
            loadDaily();
            loadRevenue(document.querySelector('.periode-pemasukan-btn.active')?.dataset.period || 'minggu');
            loadTrend(document.getElementById('trenPemasukanPeriode').value);
            loadServices(document.querySelector('.layanan-period-btn.active')?.dataset.period || 'minggu', document.querySelector('.layanan-sort-btn').dataset.sort);
        }
    });

    window.addEventListener('kataji:data-changed', function () {
        loadDaily();
        loadRevenue(document.querySelector('.periode-pemasukan-btn.active')?.dataset.period || 'minggu');
        loadTrend(document.getElementById('trenPemasukanPeriode').value);
        loadServices(document.querySelector('.layanan-period-btn.active')?.dataset.period || 'minggu', document.querySelector('.layanan-sort-btn').dataset.sort);
    });
});
