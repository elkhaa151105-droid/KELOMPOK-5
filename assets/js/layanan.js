document.addEventListener('DOMContentLoaded', function () {
    const API_LAYANAN = '/KELOMPOK-5/api/layanan/';

    // Elemen form tambah dan tabel.
    const form = document.getElementById('formTambahLayanan');
    const namaInput = document.getElementById('namaLayanan');
    const hargaInput = document.getElementById('hargaLayanan');
    const hppInput = document.getElementById('hppLayanan');
    const tableBody = document.getElementById('layananTableBody');
    let notification = document.getElementById('layananNotifikasi');

    // Elemen modal edit.
    const modal = document.getElementById('modalEditLayanan');
    const formEdit = document.getElementById('formEditLayanan');
    const editId = document.getElementById('editIdLayanan');
    const editNama = document.getElementById('editNamaLayanan');
    const editHarga = document.getElementById('editHargaLayanan');
    const editHpp = document.getElementById('editHppLayanan');
    const editIcon = document.getElementById('editIconLayanan');
    const tombolTutupModal = document.getElementById('tutupModalEditLayanan');
    const tombolSimpanEdit = document.getElementById('simpanEditLayanan');

    let notificationTimer;
    let layananSedangDiedit = null;

    // Membuat notifikasi otomatis jika elemen belum tersedia di HTML.
// Menampilkan notifikasi dengan gaya yang sama seperti Kasir.

function tampilkanNotifikasi(pesan, jenis) {
    let notification = document.getElementById('layananNotifikasi');

    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'layananNotifikasi';
        document.body.appendChild(notification);
    }

    clearTimeout(notificationTimer);

    notification.className = 'transaction-success';
    notification.textContent = pesan;

    // Warna merah untuk hapus, nonaktif, dan error.
    if (jenis === 'hapus' || jenis === 'nonaktif' || jenis === 'error') {
        notification.style.backgroundColor = '#dc3545';
        notification.style.color = '#ffffff';
    } else {
        // Warna hijau untuk tambah, edit, dan aktivasi.
        notification.style.backgroundColor = '#2E9E5B';
        notification.style.color = '#ffffff';
    }

    requestAnimationFrame(function () {
        notification.classList.add('show');
    });

    notificationTimer = setTimeout(function () {
        notification.classList.remove('show');
    }, 2500);
}


    // Mengirim request ke API.
    async function requestAPI(method, data) {
        const options = {
            method: method,
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
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
        throw new Error(
            result.message ||
            'Gagal menyimpan layanan. Status HTTP: ' + response.status
        );
    }

        return result;
    }

    // Format angka menjadi Rupiah.
    function rupiah(nilai) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(nilai) || 0);
    }

    // Membuat input angka untuk tabel.
    function buatInputAngka(className, value, min) {
        const input = document.createElement('input');

        input.type = 'number';
        input.className = className;
        input.min = String(min);
        input.step = '1';
        input.value = Number(value) || 0;

        input.setAttribute(
            'aria-label',
            className.includes('price') ? 'Harga layanan' : 'HPP layanan'
        );

        return input;
    }

    // Membuat tombol dengan aksi tertentu.
    function buatTombol(teks, className, aksi) {
        const tombol = document.createElement('button');

        tombol.type = 'button';
        tombol.className = className;
        tombol.textContent = teks;
        tombol.addEventListener('click', aksi);

        return tombol;
    }

    // Membersihkan pesan error pada modal edit.
    function bersihkanErrorEdit() {
        [
            'errorEditNamaLayanan',
            'errorEditHargaLayanan',
            'errorEditHppLayanan'
        ].forEach(function (id) {
            const elemen = document.getElementById(id);
            if (elemen) elemen.textContent = '';
        });
    }

    // Membuka modal dan mengisi data layanan.
    function bukaModalEdit(layanan) {
        layananSedangDiedit = layanan;

        editId.value = layanan.id_layanan;
        editNama.value = layanan.nama_layanan || '';
        editHarga.value = Number(layanan.harga) || 0;
        editHpp.value = Number(layanan.hpp) || 0;

        // Ikon belum dapat disimpan melalui API yang tersedia.
        if (editIcon) editIcon.value = '';

        bersihkanErrorEdit();

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('layanan-modal-open');

        editNama.focus();
    }

    // Menutup modal edit.
    function tutupModalEdit() {
        if (!modal || !formEdit) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('layanan-modal-open');

        formEdit.reset();
        bersihkanErrorEdit();
        layananSedangDiedit = null;
    }

    if (tombolTutupModal) {
        tombolTutupModal.addEventListener('click', tutupModalEdit);
    }

    // Klik area gelap di luar modal untuk menutup modal.
    if (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                tutupModalEdit();
            }
        });
    }

    // Tombol Escape menutup modal.
    document.addEventListener('keydown', function (event) {
        if (
            event.key === 'Escape' &&
            modal &&
            modal.classList.contains('is-open')
        ) {
            tutupModalEdit();
        }
    });

    // Menyimpan perubahan layanan melalui API PUT.
    if (formEdit) {
        formEdit.addEventListener('submit', async function (event) {
            event.preventDefault();
            bersihkanErrorEdit();

            const nama = editNama.value.trim();
            const harga = Number(editHarga.value);
            const hpp = Number(editHpp.value);

            let valid = true;

            const errorNama = document.getElementById('errorEditNamaLayanan');
            const errorHarga = document.getElementById('errorEditHargaLayanan');
            const errorHpp = document.getElementById('errorEditHppLayanan');

            if (!nama || nama.length > 100) {
                if (errorNama) {
                    errorNama.textContent =
                        'Nama wajib diisi (maksimal 100 karakter).';
                }
                valid = false;
            }

            if (!Number.isInteger(harga) || harga <= 0) {
                if (errorHarga) {
                    errorHarga.textContent =
                        'Harga harus berupa bilangan bulat lebih dari nol.';
                }
                valid = false;
            }

            if (!Number.isInteger(hpp) || hpp < 0) {
                if (errorHpp) {
                    errorHpp.textContent =
                        'HPP harus berupa bilangan bulat nol atau lebih.';
                }
                valid = false;
            }

            if (!valid || !layananSedangDiedit) return;

            tombolSimpanEdit.disabled = true;
            tombolSimpanEdit.textContent = 'Menyimpan...';

            try {
                const result = await requestAPI('PUT', {
                    id_layanan: Number(editId.value),
                    nama_layanan: nama,
                    harga: harga,
                    hpp: hpp
                });

                tutupModalEdit();

                tampilkanNotifikasi(
                    result.message || 'Layanan berhasil diperbarui.',
                    'berhasil'
                );

                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            } finally {
                tombolSimpanEdit.disabled = false;
                tombolSimpanEdit.textContent = 'Simpan Layanan';
            }
        });
    }

    // Membuat satu baris data layanan.
    function buatBaris(layanan) {
        const row = document.createElement('tr');
        row.dataset.serviceRow = 'true';
        row.dataset.idLayanan = layanan.id_layanan;

        // Kolom nama layanan.
        const namaCell = document.createElement('td');
        const namaInputBaris = document.createElement('input');

        namaInputBaris.type = 'text';
        namaInputBaris.className = 'layanan-name-input';
        namaInputBaris.maxLength = 100;
        namaInputBaris.value = layanan.nama_layanan || '';
        namaInputBaris.setAttribute('aria-label', 'Nama layanan');
        namaCell.appendChild(namaInputBaris);

        // Kolom harga.
        const hargaCell = document.createElement('td');
        const hargaInputBaris = buatInputAngka(
            'layanan-price-input',
            layanan.harga,
            1
        );
        hargaCell.appendChild(hargaInputBaris);

        // Kolom HPP.
        const hppCell = document.createElement('td');
        const hppInputBaris = buatInputAngka(
            'layanan-hpp-input',
            layanan.hpp,
            0
        );
        hppCell.appendChild(hppInputBaris);

        // Kolom status aktif.
        const statusCell = document.createElement('td');
        const status = document.createElement('input');

        status.type = 'checkbox';
        status.className = 'layanan-checkbox';
        // Checkbox mengikuti status asli layanan dari API.
        status.checked = Number(layanan.aktif) === 1;
        status.setAttribute('aria-label', 'Status layanan aktif');
        statusCell.appendChild(status);

        // Kolom aksi.
        const aksiCell = document.createElement('td');
        aksiCell.className = 'layanan-aksi';

        
        // Tombol edit bisa digunakan untuk semua layanan.
        aksiCell.appendChild(
            buatTombol('Edit', 'layanan-edit-button', function () {
                bukaModalEdit({
                    id_layanan: layanan.id_layanan,
                    nama_layanan: namaInputBaris.value.trim(),
                    harga: hargaInputBaris.value,
                    hpp: hppInputBaris.value
                });
            })
        );


        // Tombol hapus permanen.
        aksiCell.appendChild(
            buatTombol('Hapus', 'layanan-hapus-button', async function () {
                const nama =
                    namaInputBaris.value.trim() || layanan.nama_layanan;

                if (!confirm('Yakin ingin menghapus layanan "' + nama + '"?')) {
                    return;
                }

                try {
                    const result = await requestAPI('DELETE', {
                        id_layanan: Number(layanan.id_layanan)
                    });

                    
                tampilkanNotifikasi(
                    result.message || 'Layanan berhasil dihapus.',
                    'hapus'
                );


                    await muatLayanan();
                } catch (error) {
                    tampilkanNotifikasi(error.message, 'error');
                }
            })
        );

        // Checkbox untuk menonaktifkan layanan.
       
        // Mengaktifkan atau menonaktifkan layanan.
        status.addEventListener('change', async function () {
            const statusSebelumnya = !status.checked;
            const aktifBaru = status.checked ? 1 : 0;
            const nama = namaInputBaris.value.trim() || layanan.nama_layanan;

            const konfirmasi = aktifBaru === 1
                ? 'Aktifkan kembali layanan "' + nama + '"?'
                : 'Nonaktifkan layanan "' + nama + '"?';

            if (!confirm(konfirmasi)) {
                status.checked = statusSebelumnya;
                return;
            }

            status.disabled = true;

            try {
                const result = await requestAPI('PATCH', {
                    id_layanan: Number(layanan.id_layanan),
                    aktif: aktifBaru
                });

                layanan.aktif = aktifBaru;

                tampilkanNotifikasi(
                    result.message || (
                        aktifBaru === 1
                            ? 'Layanan berhasil diaktifkan.'
                            : 'Layanan berhasil dinonaktifkan.'
                    ),
                     aktifBaru === 1 ? 'berhasil' : 'nonaktif'
                );

                await muatLayanan();
            } catch (error) {
                status.checked = statusSebelumnya;
                tampilkanNotifikasi(error.message, 'error');
            } finally {
                status.disabled = false;
            }
        });


        row.append(namaCell, hargaCell, hppCell, statusCell, aksiCell);

        return row;
    }

    // Memuat data layanan dari API.
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
                cell.textContent = 'Belum ada layanan.';
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

    // Membersihkan pesan error pada form tambah.
    function hapusErrorTambah() {
        [
            'errorNamaLayanan',
            'errorHargaLayanan',
            'errorHppLayanan'
        ].forEach(function (id) {
            const elemen = document.getElementById(id);
            if (elemen) elemen.textContent = '';
        });
    }

    // Menambah layanan menggunakan API POST.
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            hapusErrorTambah();

            const nama = namaInput.value.trim();
            const harga = Number(hargaInput.value);
            const hpp = Number(hppInput.value);

            let valid = true;

            const errorNama = document.getElementById('errorNamaLayanan');
            const errorHarga = document.getElementById('errorHargaLayanan');
            const errorHpp = document.getElementById('errorHppLayanan');

            if (!nama || nama.length > 100) {
                if (errorNama) {
                    errorNama.textContent =
                        'Nama wajib diisi (maksimal 100 karakter).';
                }
                valid = false;
            }

            if (!Number.isInteger(harga) || harga <= 0) {
                if (errorHarga) {
                    errorHarga.textContent =
                        'Harga harus berupa bilangan bulat lebih dari nol.';
                }
                valid = false;
            }

            if (!Number.isInteger(hpp) || hpp < 0) {
                if (errorHpp) {
                    errorHpp.textContent =
                        'HPP harus berupa bilangan bulat nol atau lebih.';
                }
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

                tampilkanNotifikasi(
                    result.message || 'Layanan berhasil ditambahkan.',
                    'berhasil'
                );

                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // Menampilkan data saat halaman dibuka.
    muatLayanan();
});