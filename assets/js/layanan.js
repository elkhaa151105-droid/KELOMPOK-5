document.addEventListener('DOMContentLoaded', function () {
    const API_LAYANAN = '/KELOMPOK-5/api/layanan/index.php';

    // Elemen form tambah dan tabel.
    const form = document.getElementById('formTambahLayanan');
    const namaInput = document.getElementById('namaLayanan');
    const hargaInput = document.getElementById('hargaLayanan');
    const hppInput = document.getElementById('hppLayanan');
    const iconInput = document.getElementById('iconLayanan');
    const tableBody = document.getElementById('layananTableBody');

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

    // Menampilkan notifikasi.
    function tampilkanNotifikasi(pesan, jenis) {
        let notification = document.getElementById('layananNotifikasi');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'layananNotifikasi';
            document.body.appendChild(notification);
        }

        clearTimeout(notificationTimer);

        // Gunakan gaya notifikasi yang sama dengan halaman kasir.
        // Notifikasi sukses memakai hijau lembut; error memakai merah lembut.
        notification.className = 'transaction-success';
        if (jenis === 'error') {
            notification.classList.add('transaction-error');
        }
        notification.textContent = pesan;

        requestAnimationFrame(function () {
            notification.classList.add('show');
        });

        notificationTimer = setTimeout(function () {
            notification.classList.remove('show');
        }, 2500);
    }

    // Mengirim request JSON atau FormData ke API.
    async function requestAPI(method, data) {
        const options = {
            method: method,
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        };

        if (data instanceof FormData) {
            options.body = data;
        } else if (data !== undefined) {
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
                'Gagal memproses layanan. Status HTTP: ' + response.status
            );
        }

        return result;
    }

    // Membuat FormData untuk tambah layanan.
    function buatDataLayanan(nama, harga, hpp, fileIcon) {
        const data = new FormData();

        data.append('nama_layanan', nama);
        data.append('harga', String(harga));
        data.append('hpp', String(hpp));

        if (fileIcon && fileIcon.size > 0) {
            data.append('icon_layanan', fileIcon);
        }

        return data;
    }

    // Memeriksa file ikon.
    function validasiIkon(file) {
        if (!file) return '';

        const tipeDiizinkan = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!tipeDiizinkan.includes(file.type)) {
            return 'Ikon harus berupa JPG, PNG, atau WebP.';
        }

        if (file.size > 2 * 1024 * 1024) {
            return 'Ukuran ikon maksimal 2 MB.';
        }

        return '';
    }

    // Membersihkan pesan error form tambah.
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

    // Membersihkan pesan error modal edit.
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

    // Membuat input angka.
    function buatInputAngka(className, value, min) {
        const input = document.createElement('input');

        input.type = 'number';
        input.className = className;
        input.min = String(min);
        input.step = '1';
        input.value = value === null || value === undefined || value === ''
            ? ''
            : String(value);

        input.setAttribute(
            'aria-label',
            className.includes('price') ? 'Harga layanan' : 'HPP layanan'
        );

        return input;
    }

    // Membuat tombol aksi.
    function buatTombol(teks, className, aksi) {
        const tombol = document.createElement('button');

        tombol.type = 'button';
        tombol.className = className;
        tombol.textContent = teks;
        tombol.addEventListener('click', aksi);

        return tombol;
    }

    // Membuka modal edit dan mengisi data.
    function bukaModalEdit(layanan) {
        if (!modal || !formEdit) return;

        layananSedangDiedit = layanan;

        editId.value = layanan.id_layanan;
        editNama.value = layanan.nama_layanan || '';
        editHarga.value = Number(layanan.harga) || 0;
        editHpp.value = layanan.hpp === null || layanan.hpp === undefined
            ? ''
            : String(layanan.hpp);

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

    if (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                tutupModalEdit();
            }
        });
    }

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
            const hppRaw = editHpp.value.trim();
            const hpp = Number(hppRaw);

            const errorNama = document.getElementById('errorEditNamaLayanan');
            const errorHarga = document.getElementById('errorEditHargaLayanan');
            const errorHpp = document.getElementById('errorEditHppLayanan');

            let valid = true;

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

            if (hppRaw === '' || !Number.isInteger(hpp) || hpp <= 0 || hpp > 2147483647) {
                if (errorHpp) {
                    errorHpp.textContent =
                        'HPP wajib berupa bilangan bulat lebih dari nol.';
                }
                valid = false;
            }

            const fileIcon = editIcon && editIcon.files
                ? editIcon.files[0]
                : null;

            const errorIkon = validasiIkon(fileIcon);

            if (errorIkon) {
                tampilkanNotifikasi(errorIkon, 'error');
                valid = false;
            }

            if (!valid || !layananSedangDiedit) return;

            tombolSimpanEdit.disabled = true;
            tombolSimpanEdit.textContent = 'Menyimpan...';

            try {
                let result;

                if (fileIcon) {
                    // BE menerima upload edit melalui POST dengan _method=PUT.
                    const data = buatDataLayanan(nama, harga, hpp, fileIcon);
                    data.append('_method', 'PUT');
                    data.append('id_layanan', String(editId.value));

                    result = await requestAPI('POST', data);
                } else {
                    // Tanpa ikon baru, gunakan request PUT JSON.
                    result = await requestAPI('PUT', {
                        id_layanan: Number(editId.value),
                        nama_layanan: nama,
                        harga: harga,
                        hpp: hpp
                    });
                }

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

    // Membuat baris tabel layanan.
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
            1
        );
        hppCell.appendChild(hppInputBaris);

        // Kolom status aktif.
        const statusCell = document.createElement('td');
        const status = document.createElement('input');

        status.type = 'checkbox';
        status.className = 'layanan-checkbox';
        status.checked = Number(layanan.aktif) === 1;
        status.setAttribute('aria-label', 'Status layanan aktif');
        statusCell.appendChild(status);

        // Kolom aksi.
        const aksiCell = document.createElement('td');
        aksiCell.className = 'layanan-aksi';

        aksiCell.appendChild(
            buatTombol('Edit', 'layanan-edit-button', function () {
                bukaModalEdit({
                    id_layanan: layanan.id_layanan,
                    nama_layanan: namaInputBaris.value.trim(),
                    harga: hargaInputBaris.value,
                    hpp: hppInputBaris.value,
                    icon_layanan: layanan.icon_layanan
                });
            })
        );

        // Menghapus layanan secara permanen.
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

    // Menambah layanan menggunakan API POST.
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            hapusErrorTambah();

            const nama = namaInput.value.trim();
            const harga = Number(hargaInput.value);
            const hppRaw = hppInput.value.trim();
            const hpp = Number(hppRaw);

            const errorNama = document.getElementById('errorNamaLayanan');
            const errorHarga = document.getElementById('errorHargaLayanan');
            const errorHpp = document.getElementById('errorHppLayanan');

            let valid = true;

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

            if (hppRaw === '' || !Number.isInteger(hpp) || hpp <= 0 || hpp > 2147483647) {
                if (errorHpp) {
                    errorHpp.textContent =
                        'HPP wajib berupa bilangan bulat lebih dari nol.';
                }
                valid = false;
            }

            const fileIcon = iconInput && iconInput.files
                ? iconInput.files[0]
                : null;

            const errorIkon = validasiIkon(fileIcon);

            if (errorIkon) {
                tampilkanNotifikasi(errorIkon, 'error');
                valid = false;
            }

            if (!valid) return;

            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Menyimpan...';
            }

            try {
                const data = buatDataLayanan(nama, harga, hpp, fileIcon);
                const result = await requestAPI('POST', data);

                form.reset();

                tampilkanNotifikasi(
                    result.message || 'Layanan berhasil ditambahkan.',
                    'berhasil'
                );

                await muatLayanan();
            } catch (error) {
                tampilkanNotifikasi(error.message, 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Tambah';
                }
            }
        });
    }

    // Memuat data saat halaman dibuka.
    muatLayanan();
});