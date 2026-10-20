
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/KELOMPOK-5/api/pengeluaran/index.php';

    // Mengambil elemen form dan input.
    const form = document.getElementById('formPengeluaranHarian');
    const kategoriInput = document.getElementById('kategoriPengeluaranHarian');
    const nominalInput = document.getElementById('nominalPengeluaranHarian');
    const tanggalInput = document.getElementById('tanggalPengeluaranHarian');

    // Mengambil elemen pesan error dan tombol simpan.
    const errorKategori = document.getElementById('errorKategoriPengeluaranHarian');
    const errorNominal = document.getElementById('errorNominalPengeluaranHarian');
    const tombolSimpan = document.getElementById('btnSimpanPengeluaran');

    // Mengambil elemen daftar, total, dan status.
    const totalElement = document.getElementById('totalPengeluaranHarian');
    const ringkasanElement = document.getElementById('totalRingkasanPengeluaran');
    const daftarElement = document.getElementById('daftarPengeluaranHarian');
    const statusElement = document.getElementById('statusPengeluaranHarian');

    // Memastikan semua elemen wajib tersedia sebelum kode dijalankan.
    if (
        !form ||
        !kategoriInput ||
        !nominalInput ||
        !tanggalInput ||
        !errorKategori ||
        !errorNominal ||
        !tombolSimpan ||
        !totalElement ||
        !daftarElement ||
        !statusElement
    ) {
        console.error('Elemen halaman pengeluaran belum lengkap.');
        return;
    }

    // Menggunakan validasi sendiri, bukan popup bawaan browser.
    form.noValidate = true;

    // Membuat elemen notifikasi jika belum tersedia di HTML.
    let toast = document.getElementById('pengeluaranToast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pengeluaranToast';
        toast.className = 'pengeluaran-toast';
        toast.hidden = true;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    let toastTimer;

    // Menampilkan notifikasi selama tiga detik.
    function tampilkanNotifikasi(pesan, jenis = 'berhasil') {
        clearTimeout(toastTimer);

        toast.textContent = pesan;
        toast.className = 'pengeluaran-toast';

        if (jenis === 'gagal') {
            toast.classList.add('gagal');
        } else {
            toast.classList.add('berhasil');
        }

        toast.hidden = false;

        toastTimer = setTimeout(() => {
            toast.hidden = true;
        }, 3000);
    }

    // Mengubah angka menjadi format rupiah.
    function formatRupiah(nilai) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(nilai) || 0);
    }

    // Mengambil tanggal lokal agar tidak bergeser karena UTC.
    function tanggalLokal() {
        const sekarang = new Date();
        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
        const hari = String(sekarang.getDate()).padStart(2, '0');

        return `${tahun}-${bulan}-${hari}`;
    }

    // Mengubah tanggal YYYY-MM-DD menjadi DD/MM/YYYY.
    function formatTanggal(tanggal) {
        if (!tanggal) return '-';

        const bagian = tanggal.slice(0, 10).split('-');

        if (bagian.length !== 3) return tanggal;

        return `${bagian[2]}/${bagian[1]}/${bagian[0]}`;
    }

    // Menampilkan status proses pemuatan data.
    function tampilkanStatus(pesan) {
        statusElement.textContent = pesan;
    }

    // Menghapus pesan error dan penanda input salah.
    function bersihkanError(input, elemenError) {
        input.classList.remove('input-error');
        input.removeAttribute('aria-invalid');
        elemenError.textContent = '';
    }

    // Menampilkan pesan error pada input terkait.
    function tampilkanError(input, elemenError, pesan) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        elemenError.textContent = pesan;
    }

    // Memvalidasi kategori dan nominal sebelum data disimpan.
    function validasiForm() {
        bersihkanError(kategoriInput, errorKategori);
        bersihkanError(nominalInput, errorNominal);

        let valid = true;

        // Kategori wajib dipilih.
        if (!kategoriInput.value.trim()) {
            tampilkanError(
                kategoriInput,
                errorKategori,
                '*Kategori wajib diisi'
            );
            valid = false;
        }

        // Nominal wajib berupa bilangan bulat positif.
        const nominal = nominalInput.value.trim();
        const angkaNominal = Number(nominal);

        if (nominal === '') {
            tampilkanError(
                nominalInput,
                errorNominal,
                '*Nominal harus diisi'
            );
            valid = false;
        } else if (
            !Number.isFinite(angkaNominal) ||
            angkaNominal <= 0 ||
            !Number.isInteger(angkaNominal)
        ) {
            tampilkanError(
                nominalInput,
                errorNominal,
                '*Nominal harus lebih dari nol'
            );
            valid = false;
        } else if (angkaNominal > 2147483647) {
            tampilkanError(
                nominalInput,
                errorNominal,
                '*Nominal terlalu besar'
            );
            valid = false;
        }

        return valid;
    }

    // Menghapus error kategori setelah pengguna memilih kategori.
    kategoriInput.addEventListener('change', () => {
        if (kategoriInput.value.trim()) {
            bersihkanError(kategoriInput, errorKategori);
        }
    });

    // Menghapus error nominal setelah nilainya diperbaiki.
    nominalInput.addEventListener('input', () => {
        const nominal = nominalInput.value.trim();
        const nilai = Number(nominal);

        if (
            nominal !== '' &&
            Number.isFinite(nilai) &&
            nilai > 0 &&
            Number.isInteger(nilai) &&
            nilai <= 2147483647
        ) {
            bersihkanError(nominalInput, errorNominal);
        }
    });

    // Membuat elemen tabel dengan teks yang aman.
    function buatSel(teks) {
        const sel = document.createElement('td');
        sel.textContent = teks;
        return sel;
    }

    // Menampilkan pesan ketika daftar pengeluaran kosong.
    function tampilkanKosong(pesan) {
        daftarElement.replaceChildren();

        const baris = document.createElement('tr');
        const sel = document.createElement('td');

        sel.colSpan = 4;
        sel.className = 'pengeluaran-empty';
        sel.textContent = pesan;

        baris.appendChild(sel);
        daftarElement.appendChild(baris);
    }

    // Membuat tombol hapus berupa simbol X saja.
    function buatTombolHapus(item) {
        const tombol = document.createElement('button');

        tombol.type = 'button';
        tombol.className = 'pengeluaran-delete-button';
        tombol.textContent = '×';
        tombol.setAttribute('aria-label', 'Hapus pengeluaran');

        tombol.addEventListener('click', async () => {
            const yakin = window.confirm(
                `Yakin ingin menghapus pengeluaran ${formatRupiah(item.nominal)}?`
            );

            if (!yakin) return;

            tombol.disabled = true;

            try {
                const respons = await fetch(API_URL, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        id_pengeluaran: item.id_pengeluaran
                    })
                });

                const hasil = await respons.json().catch(() => ({}));

                if (!respons.ok || hasil.success !== true) {
                    throw new Error(
                        hasil.message || 'Pengeluaran gagal dihapus.'
                    );
                }

                // Notifikasi penghapusan menggunakan warna merah.
                tampilkanNotifikasi(
                    'Pengeluaran berhasil dihapus.',
                    'gagal'
                );

                await muatPengeluaran();
            } catch (error) {
                tampilkanNotifikasi(
                    error.message || 'Terjadi kesalahan saat menghapus.',
                    'gagal'
                );

                tombol.disabled = false;
            }
        });

        return tombol;
    }

    // Menampilkan daftar pengeluaran dari respons API.
    function tampilkanDaftar(data) {
        daftarElement.replaceChildren();

        const daftar = Array.isArray(data.pengeluaran)
            ? data.pengeluaran
            : [];

        if (daftar.length === 0) {
            tampilkanKosong('Belum ada pengeluaran pada tanggal ini.');
        } else {
            daftar.forEach((item) => {
                const baris = document.createElement('tr');

                baris.appendChild(buatSel(formatTanggal(item.tanggal)));
                baris.appendChild(buatSel(item.kategori || '-'));
                baris.appendChild(buatSel(formatRupiah(item.nominal)));

                const selAksi = document.createElement('td');
                selAksi.className = 'pengeluaran-action-cell';
                selAksi.appendChild(buatTombolHapus(item));

                baris.appendChild(selAksi);
                daftarElement.appendChild(baris);
            });
        }

        const total = Number(data.total_pengeluaran) || 0;

        totalElement.textContent = formatRupiah(total);

        if (ringkasanElement) {
            ringkasanElement.textContent = formatRupiah(total);
        }
    }

    // Memuat data berdasarkan tanggal yang dipilih.
    async function muatPengeluaran() {
        tampilkanStatus('Memuat data pengeluaran...');

        try {
            const tanggal = tanggalInput.value || tanggalLokal();

            const respons = await fetch(
                `${API_URL}?tanggal=${encodeURIComponent(tanggal)}`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            const hasil = await respons.json();

            if (!respons.ok || hasil.success !== true) {
                throw new Error(
                    hasil.message || 'Gagal memuat data pengeluaran.'
                );
            }

            tampilkanDaftar(hasil.data || {});
            tampilkanStatus('');
        } catch (error) {
            tampilkanKosong('Data pengeluaran gagal dimuat.');
            tampilkanStatus(
                error.message || 'Terjadi kesalahan saat memuat data.'
            );
        }
    }

    // Menangani penyimpanan pengeluaran.
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Data tidak dikirim jika validasi gagal.
        if (!validasiForm()) return;

        tombolSimpan.disabled = true;

        // Menyimpan tanggal agar tidak hilang setelah form direset.
        const tanggalTerpilih = tanggalInput.value || tanggalLokal();

        try {
            const payload = {
                kategori: kategoriInput.value.trim(),
                nominal: Number(nominalInput.value),
                tanggal: tanggalTerpilih
            };

            const respons = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const hasil = await respons.json().catch(() => ({}));

            if (!respons.ok || hasil.success !== true) {
                throw new Error(
                    hasil.message || 'Pengeluaran gagal disimpan.'
                );
            }

            // Mengosongkan kategori dan nominal setelah berhasil disimpan.
            form.reset();

            // Mempertahankan tanggal yang sebelumnya dipilih.
            tanggalInput.value = tanggalTerpilih;

            bersihkanError(kategoriInput, errorKategori);
            bersihkanError(nominalInput, errorNominal);

            tampilkanNotifikasi(
                'Pengeluaran berhasil disimpan.',
                'berhasil'
            );

            await muatPengeluaran();
        } catch (error) {
            tampilkanNotifikasi(
                error.message || 'Terjadi kesalahan saat menyimpan.',
                'gagal'
            );
        } finally {
            tombolSimpan.disabled = false;
        }
    });

    // Mengatur tanggal awal dan memuat data saat halaman dibuka.
    tanggalInput.value = tanggalLokal();
    tanggalInput.addEventListener('change', muatPengeluaran);

    // Memastikan pesan error tidak muncul saat halaman pertama dibuka.
    bersihkanError(kategoriInput, errorKategori);
    bersihkanError(nominalInput, errorNominal);

    muatPengeluaran();
});
