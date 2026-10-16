document.addEventListener('DOMContentLoaded', function () {
    const API_LAYANAN = '/KELOMPOK-5/api/layanan/';
    const form = document.getElementById('formTambahLayanan');
    const namaInput = document.getElementById('namaLayanan');
    const hargaInput = document.getElementById('hargaLayanan');
    const hppInput = document.getElementById('hppLayanan');
    const tableBody = document.getElementById('layananTableBody');
    const notification = document.getElementById('layananNotifikasi');
    let notificationTimer;

    // Menampilkan pesan berhasil atau gagal di halaman.
    function tampilkanNotifikasi(pesan, jenis) {
        if (!notification) return;
        clearTimeout(notificationTimer);
        notification.textContent = pesan;
        notification.className = 'layanan-notifikasi ' + (jenis || '');
        notificationTimer = setTimeout(function () {
            notification.textContent = '';
            notification.className = 'layanan-notifikasi';
        }, 4000);
    }

    // Mengirim request ke API yang sudah disediakan.
    async function requestAPI(method, data) {
        const options = {
            method: method,
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        };

        if (data !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }

        const response = await fetch(API_LAYANAN, options);
        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Respons API bukan JSON yang valid.');
        }

        if (!response.ok || result.success === false) {
            throw new Error(result.message || 'Permintaan gagal. Silakan coba lagi.');
        }
        return result;
    }

    function rupiah(nilai) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', maximumFractionDigits: 0
        }).format(Number(nilai) || 0);
    }

    function buatInputAngka(className, value, min) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = className;
        input.min = String(min);
        input.step = '1';
        input.value = Number(value) || 0;
        input.setAttribute('aria-label', className.includes('price') ? 'Harga layanan' : 'HPP layanan');
        return input;
    }

    function buatTombol(teks, className, aksi) {
        const tombol = document.createElement('button');
        tombol.type = 'button';
        tombol.className = className;
        tombol.textContent = teks;
        tombol.addEventListener('click', aksi);
        return tombol;
    }

    // Membuat satu baris dari data API, bukan dari data contoh statis.
    function buatBaris(layanan) {
        const row = document.createElement('tr');
        row.dataset.serviceRow = 'true';
        row.dataset.idLayanan = layanan.id_layanan;

        const namaCell = document.createElement('td');
        const namaInputBaris = document.createElement('input');
        namaInputBaris.type = 'text';
        namaInputBaris.className = 'layanan-name-input';
        namaInputBaris.maxLength = 100;
        namaInputBaris.value = layanan.nama_layanan || '';
        namaInputBaris.setAttribute('aria-label', 'Nama layanan');
        namaCell.appendChild(namaInputBaris);

        const hargaCell = document.createElement('td');
        const hargaInputBaris = buatInputAngka('layanan-price-input', layanan.harga, 1);
        hargaCell.appendChild(hargaInputBaris);

        const hppCell = document.createElement('td');
        const hppInputBaris = buatInputAngka('layanan-hpp-input', layanan.hpp, 0);
        hppCell.appendChild(hppInputBaris);

        const statusCell = document.createElement('td');
        const status = document.createElement('input');
        status.type = 'checkbox';
        status.className = 'layanan-checkbox';
        status.checked = true;
        status.setAttribute('aria-label', 'Status layanan aktif');
        statusCell.appendChild(status);

        const aksiCell = document.createElement('td');
        aksiCell.className = 'layanan-aksi';
        aksiCell.appendChild(buatTombol('Simpan', 'layanan-edit-button', async function () {
            const nama = namaInputBaris.value.trim();
            const harga = Number(hargaInputBaris.value);
            const hpp = Number(hppInputBaris.value);

            if (!nama || nama.length > 100) {
                tampilkanNotifikasi('Nama layanan wajib diisi (maksimal 100 karakter).', 'error');
                return;
            }
            if (!Number.isInteger(harga) || harga <= 0) {
                tampilkanNotifikasi('Harga harus berupa bilangan bulat lebih dari nol.', 'error');
                return;
            }
            if (!Number.isInteger(hpp) || hpp < 0) {
                tampilkanNotifikasi('HPP harus berupa bilangan bulat nol atau lebih.', 'error');
                return;
            }

            try {
                const result = await requestAPI('PUT', {
                    id_layanan: Number(layanan.id_layanan),
                    nama_layanan: nama,
                    harga: harga,
                    hpp: hpp
                });
                tampilkanNotifikasi(result.message || 'Layanan berhasil diperbarui.', 'berhasil');
                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            }
        }));

        aksiCell.appendChild(buatTombol('Nonaktifkan', 'layanan-nonaktif-button', async function () {
            if (!confirm('Nonaktifkan layanan "' + (namaInputBaris.value.trim() || layanan.nama_layanan || '') + '"?')) return;
            try {
                const result = await requestAPI('PATCH', {
                    id_layanan: Number(layanan.id_layanan), aktif: 0
                });
                tampilkanNotifikasi(result.message || 'Layanan berhasil dinonaktifkan.', 'berhasil');
                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            }
        }));

        aksiCell.appendChild(buatTombol('Hapus', 'layanan-hapus-button', async function () {
            if (!confirm('Yakin ingin menghapus layanan "' + (namaInputBaris.value.trim() || layanan.nama_layanan || '') + '"?')) return;
            try {
                const result = await requestAPI('DELETE', {
                    id_layanan: Number(layanan.id_layanan)
                });
                tampilkanNotifikasi(result.message || 'Layanan berhasil dihapus.', 'berhasil');
                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            }
        }));

        // API hanya menampilkan layanan aktif; checkbox digunakan untuk menonaktifkan.
        status.addEventListener('change', async function () {
            if (!status.checked) {
                if (!confirm('Nonaktifkan layanan "' + (namaInputBaris.value.trim() || layanan.nama_layanan || '') + '"?')) {
                    status.checked = true;
                    return;
                }
                try {
                    const result = await requestAPI('PATCH', {
                        id_layanan: Number(layanan.id_layanan), aktif: 0
                    });
                    tampilkanNotifikasi(result.message || 'Layanan berhasil dinonaktifkan.', 'berhasil');
                    await muatLayanan();
                } catch (error) {
                    status.checked = true;
                    tampilkanNotifikasi(error.message, 'error');
                }
            }
        });

        row.append(namaCell, hargaCell, hppCell, statusCell, aksiCell);
        return row;
    }

    // Mengambil daftar layanan aktif dari API.
    async function muatLayanan() {
        if (!tableBody) return;
        tableBody.replaceChildren();
        const loadingRow = document.createElement('tr');
        const loadingCell = document.createElement('td');
        loadingCell.colSpan = 5;
        loadingCell.textContent = 'Memuat data layanan...';
        loadingRow.appendChild(loadingCell);
        tableBody.appendChild(loadingRow);

        try {
            const result = await requestAPI('GET');
            const daftar = Array.isArray(result.data) ? result.data : [];
            tableBody.replaceChildren();

            if (daftar.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 5;
                cell.textContent = 'Belum ada layanan aktif.';
                row.appendChild(cell);
                tableBody.appendChild(row);
                return;
            }

            daftar.forEach(function (layanan) {
                tableBody.appendChild(buatBaris(layanan));
            });
        } catch (error) {
            tableBody.replaceChildren();
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'Data layanan gagal dimuat.';
            row.appendChild(cell);
            tableBody.appendChild(row);
            tampilkanNotifikasi(error.message, 'error');
        }
    }

    function hapusError() {
        ['errorNamaLayanan', 'errorHargaLayanan', 'errorHppLayanan'].forEach(function (id) {
            const elemen = document.getElementById(id);
            if (elemen) elemen.textContent = '';
        });
    }

    // Menambah layanan lewat API.
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            hapusError();

            const nama = namaInput.value.trim();
            const harga = Number(hargaInput.value);
            const hpp = Number(hppInput.value);
            let valid = true;

            if (!nama || nama.length > 100) {
                document.getElementById('errorNamaLayanan').textContent = 'Nama wajib diisi (maksimal 100 karakter).';
                valid = false;
            }
            if (!Number.isInteger(harga) || harga <= 0) {
                document.getElementById('errorHargaLayanan').textContent = 'Harga harus berupa bilangan bulat lebih dari nol.';
                valid = false;
            }
            if (!Number.isInteger(hpp) || hpp < 0) {
                document.getElementById('errorHppLayanan').textContent = 'HPP harus berupa bilangan bulat nol atau lebih.';
                valid = false;
            }
            if (!valid) return;

            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            try {
                const result = await requestAPI('POST', {
                    nama_layanan: nama,
                    harga: harga,
                    hpp: hpp
                });
                form.reset();
                tampilkanNotifikasi(result.message || 'Layanan berhasil ditambahkan.', 'berhasil');
                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    muatLayanan();
});
