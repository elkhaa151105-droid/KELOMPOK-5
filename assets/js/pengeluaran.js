document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/KELOMPOK-5/api/pengeluaran/index.php';

    const form = document.getElementById('formPengeluaranHarian');
    const kategoriInput = document.getElementById('kategoriPengeluaranHarian');
    const nominalInput = document.getElementById('nominalPengeluaranHarian');
    const tanggalInput = document.getElementById('tanggalPengeluaranHarian');
    const errorNominal = document.getElementById('errorNominalPengeluaranHarian');
    const tombolSimpan = document.getElementById('btnSimpanPengeluaran');

    const totalElement = document.getElementById('totalPengeluaranHarian');
    const ringkasanElement = document.getElementById('totalRingkasanPengeluaran');
    const periodeElement = document.getElementById('periodePengeluaran');
    const daftarElement = document.getElementById('daftarPengeluaranHarian');
    const statusElement = document.getElementById('statusPengeluaranHarian');

    // Pastikan elemen utama tersedia sebelum JavaScript dijalankan.
    if (
        !form || !kategoriInput || !nominalInput || !tanggalInput ||
        !errorNominal || !tombolSimpan || !totalElement ||
        !ringkasanElement || !periodeElement || !daftarElement ||
        !statusElement
    ) {
        return;
    }

    // Validasi ditangani JavaScript agar pesan nominal dari Trello tampil.
    form.noValidate = true;

    function formatRupiah(nominal) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(nominal) || 0);
    }

    // Mengambil tanggal lokal, bukan tanggal UTC.
    function tanggalLokal() {
        const sekarang = new Date();

        return [
            sekarang.getFullYear(),
            String(sekarang.getMonth() + 1).padStart(2, '0'),
            String(sekarang.getDate()).padStart(2, '0')
        ].join('-');
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return '-';

        const bagian = String(tanggal).slice(0, 10).split('-');

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

        sel.colSpan = 3;
        sel.className = 'pengeluaran-empty';

        baris.appendChild(sel);
        daftarElement.replaceChildren(baris);
    }

    function tampilkanTotal(total) {
        const nilai = formatRupiah(total);

        totalElement.textContent = nilai;
        ringkasanElement.textContent = nilai;
    }

    async function muatPengeluaran() {
        const tanggal = tanggalInput.value;

        daftarElement.replaceChildren();
        tampilkanTotal(0);
        periodeElement.textContent = formatTanggal(tanggal);

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
                    headers: {
                        Accept: 'application/json'
                    }
                }
            );

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(
                    hasil.message || 'Gagal mengambil data pengeluaran.'
                );
            }

            const data = hasil.data;
            const daftar = Array.isArray(data.pengeluaran)
                ? data.pengeluaran
                : [];

            // Total tanggal terpilih ditampilkan di dua bagian.
            tampilkanTotal(data.total_pengeluaran);

            if (daftar.length === 0) {
                tampilkanKosong(
                    'Belum ada pengeluaran pada tanggal ini.'
                );
                tampilkanStatus(
                    'Belum ada pengeluaran pada tanggal ini.'
                );
                return;
            }

            const fragment = document.createDocumentFragment();

            daftar.forEach((item) => {
                const baris = document.createElement('tr');

                baris.append(
                    buatSel(formatTanggal(item.tanggal)),
                    buatSel(item.kategori || '-'),
                    buatSel(formatRupiah(item.nominal))
                );

                fragment.appendChild(baris);
            });

            daftarElement.replaceChildren(fragment);
            tampilkanStatus(`Menampilkan ${daftar.length} pengeluaran.`);
        } catch (error) {
            console.error('Gagal memuat pengeluaran:', error);

            tampilkanTotal(0);
            tampilkanKosong('Data pengeluaran gagal dimuat.');
            tampilkanStatus(
                error.message || 'Gagal memuat pengeluaran. Coba lagi.'
            );
        }
    }

    // Hapus pesan error saat pengguna memperbaiki nominal.
    nominalInput.addEventListener('input', () => {
        errorNominal.textContent = '';
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorNominal.textContent = '';

        const kategori = kategoriInput.value.trim();
        const nominalTeks = nominalInput.value.trim();
        const nominal = Number(nominalTeks);
        const tanggal = tanggalInput.value || tanggalLokal();

        // Nominal wajib berupa bilangan bulat positif.
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

        // Batas ini harus sesuai dengan tipe kolom nominal di database.
        if (nominal > 2147483647) {
            errorNominal.textContent =
                'Nominal melebihi batas yang diizinkan.';
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
                    tanggal
                })
            });

            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                if (
                    hasil.message === 'Nominal harus lebih dari nol'
                ) {
                    errorNominal.textContent = hasil.message;
                    nominalInput.focus();
                } else {
                    tampilkanStatus(
                        hasil.message || 'Gagal menyimpan pengeluaran.'
                    );
                }

                return;
            }

            form.reset();
            tanggalInput.value = tanggal;

            await muatPengeluaran();
            tampilkanStatus('Pengeluaran berhasil dicatat.');
        } catch (error) {
            console.error('Gagal menyimpan pengeluaran:', error);

            tampilkanStatus(
                'Tidak dapat terhubung ke server. Coba lagi.'
            );
        } finally {
            tombolSimpan.disabled = false;
            tombolSimpan.textContent = 'Simpan';
        }
    });

    // Saat tanggal berubah, muat ulang daftar dan totalnya.
    tanggalInput.addEventListener('change', muatPengeluaran);

    // Tampilkan data untuk hari ini saat halaman pertama dibuka.
    tanggalInput.value = tanggalLokal();
    muatPengeluaran();
});