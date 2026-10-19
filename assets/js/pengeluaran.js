
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/KELOMPOK-5/api/pengeluaran/index.php';

    const form = document.getElementById('formPengeluaranHarian');
    const kategoriInput = document.getElementById('kategoriPengeluaranHarian');
    const nominalInput = document.getElementById('nominalPengeluaranHarian');
    const keteranganInput = document.getElementById('keteranganPengeluaranHarian');
    const tanggalInput = document.getElementById('tanggalPengeluaranHarian');
    const errorNominal = document.getElementById('errorNominalPengeluaranHarian');
    const tombolSimpan = document.getElementById('btnSimpanPengeluaran');
    const tombolTambah = document.getElementById('btnTampilkanFormPengeluaran');
    const tombolBatal = document.getElementById('btnBatalPengeluaran');
    const totalElement = document.getElementById('totalPengeluaranHarian');
    const periodeElement = document.getElementById('periodePengeluaran');
    const daftarElement = document.getElementById('daftarPengeluaranHarian');
    const statusElement = document.getElementById('statusPengeluaranHarian');

    if (
        !form || !kategoriInput || !nominalInput || !keteranganInput ||
        !tanggalInput || !errorNominal || !tombolSimpan || !tombolTambah ||
        !tombolBatal || !totalElement || !periodeElement ||
        !daftarElement || !statusElement
    ) return;

    function formatRupiah(nominal) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(nominal) || 0);
    }

    function tanggalLokal() {
        const sekarang = new Date();
        return `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, '0')}-${String(sekarang.getDate()).padStart(2, '0')}`;
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return '-';

        const bagian = tanggal.slice(0, 10).split('-');
        if (bagian.length !== 3) return tanggal;

        return `${bagian[2]}/${bagian[1]}/${bagian[0]}`;
    }

    function tampilkanStatus(pesan) {
        statusElement.textContent = pesan;
    }

    function buatSel(nilai) {
        const sel = document.createElement('td');
        sel.textContent = nilai ?? '-';
        return sel;
    }

    function tampilkanKosong(pesan) {
        const baris = document.createElement('tr');
        const sel = buatSel(pesan);
        sel.colSpan = 4;
        sel.className = 'pengeluaran-empty';
        baris.appendChild(sel);
        daftarElement.replaceChildren(baris);
    }

    async function muatPengeluaran() {
        const tanggal = tanggalInput.value;

        periodeElement.textContent = formatTanggal(tanggal);
        daftarElement.replaceChildren();
        totalElement.textContent = formatRupiah(0);

        if (!tanggal) {
            tampilkanKosong('Silakan pilih tanggal.');
            tampilkanStatus('Silakan pilih tanggal.');
            return;
        }

        tampilkanStatus('Memuat data pengeluaran...');

        try {
            const response = await fetch(
                `${API_URL}?tanggal=${encodeURIComponent(tanggal)}`,
                {
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' }
                }
            );

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(hasil.message || 'Gagal mengambil data pengeluaran.');
            }

            const data = hasil.data;
            const daftar = Array.isArray(data.pengeluaran) ? data.pengeluaran : [];

            totalElement.textContent = formatRupiah(data.total_pengeluaran);

            if (daftar.length === 0) {
                tampilkanKosong('Belum ada pengeluaran pada tanggal ini.');
                tampilkanStatus('Belum ada pengeluaran pada tanggal ini.');
                return;
            }

            const fragment = document.createDocumentFragment();

            daftar.forEach((item) => {
                const baris = document.createElement('tr');

                baris.append(
                    buatSel(formatTanggal(item.tanggal)),
                    buatSel(item.kategori || '-'),
                    buatSel(item.keterangan || '-'),
                    buatSel(formatRupiah(item.nominal))
                );

                fragment.appendChild(baris);
            });

            daftarElement.replaceChildren(fragment);
            tampilkanStatus(`Menampilkan ${daftar.length} pengeluaran.`);
        } catch (error) {
            console.error('Gagal memuat pengeluaran:', error);
            tampilkanKosong('Data pengeluaran gagal dimuat.');
            tampilkanStatus(error.message || 'Gagal memuat pengeluaran. Coba lagi.');
        }
    }

    tombolTambah.addEventListener('click', () => {
        form.hidden = !form.hidden;

        if (!form.hidden) {
            kategoriInput.focus();
        }
    });

    tombolBatal.addEventListener('click', () => {
        form.reset();
        errorNominal.textContent = '';
        form.hidden = true;
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorNominal.textContent = '';

        const kategori = kategoriInput.value.trim();
        const nominalTeks = nominalInput.value.trim();
        const nominal = Number(nominalTeks);
        const tanggal = tanggalInput.value || tanggalLokal();
        const keterangan = keteranganInput.value.trim();

        if (
            nominalTeks === '' ||
            !/^[0-9]+$/.test(nominalTeks) ||
            !Number.isSafeInteger(nominal) ||
            nominal <= 0
        ) {
            errorNominal.textContent = 'Nominal harus lebih dari nol';
            nominalInput.focus();
            return;
        }

        if (nominal > 2147483647) {
            errorNominal.textContent = 'Nominal melebihi batas yang diizinkan.';
            nominalInput.focus();
            return;
        }

        if (!kategori) {
            tampilkanStatus('Silakan pilih kategori pengeluaran.');
            kategoriInput.focus();
            return;
        }

        tombolSimpan.disabled = true;
        tombolSimpan.textContent = 'Menyimpan...';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    kategori,
                    nominal,
                    tanggal,
                    keterangan
                })
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                if (hasil.message === 'Nominal harus lebih dari nol') {
                    errorNominal.textContent = hasil.message;
                    nominalInput.focus();
                } else {
                    tampilkanStatus(hasil.message || 'Gagal menyimpan pengeluaran.');
                }
                return;
            }

            form.reset();
            form.hidden = true;
            tanggalInput.value = tanggal;

            await muatPengeluaran();
            tampilkanStatus('Pengeluaran berhasil dicatat.');
        } catch (error) {
            console.error('Gagal menyimpan pengeluaran:', error);
            tampilkanStatus('Tidak dapat terhubung ke server. Coba lagi.');
        } finally {
            tombolSimpan.disabled = false;
            tombolSimpan.textContent = 'Simpan Pengeluaran';
        }
    });

    tanggalInput.addEventListener('change', muatPengeluaran);

    tanggalInput.value = tanggalLokal();
    muatPengeluaran();
});
