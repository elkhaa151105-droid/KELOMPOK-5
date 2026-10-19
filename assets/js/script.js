/**
 * Kataji Barber - Frontend Validation & Interactivity
 * Role: Faqih Huddin SM (Frontend Developer)
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('SCRIPT KATAJI TERLOAD');
    console.log('DOM SIAP');
console.log(
    'Tombol simpan:',
    document.getElementById('btnSimpanTransaksi')
);
    
const pesanLogin = sessionStorage.getItem('loginNotification');

if (pesanLogin) {
    sessionStorage.removeItem('loginNotification');

    let notifikasi = document.querySelector('.login-notification');

    if (!notifikasi) {
        notifikasi = document.createElement('div');
        notifikasi.className = 'transaction-success login-notification';
        document.body.appendChild(notifikasi);
    }

    notifikasi.textContent = pesanLogin;

    requestAnimationFrame(() => {
        notifikasi.classList.add('show');
    });

    setTimeout(() => {
        notifikasi.classList.remove('show');
    }, 4000);
}

function simpanNotifikasiLogin(pesan) {
    sessionStorage.setItem('loginNotification', pesan);
}
  
    // ======================================================
    // 1. LOGIN MENGGUNAKAN API BACKEND
    // ======================================================
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameWrapper = document.getElementById('usernameWrapper');
    const passwordWrapper = document.getElementById('passwordWrapper');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const passwordToggle = document.getElementById('passwordToggle');

    function showLoginError(message, errorUsername = false, errorPassword = false) {
        if (loginErrorMessage) {
            loginErrorMessage.textContent = message;
            loginErrorMessage.style.display = 'block';
        } else {
            alert(message);
        }

        if (errorUsername && usernameWrapper) {
            usernameWrapper.classList.add('has-error');
        }

        if (errorPassword && passwordWrapper) {
            passwordWrapper.classList.add('has-error');
        }
    }

    function clearLoginError() {
        if (loginErrorMessage) {
            loginErrorMessage.textContent = '';
            loginErrorMessage.style.display = 'none';
        }

        if (usernameWrapper) usernameWrapper.classList.remove('has-error');
        if (passwordWrapper) passwordWrapper.classList.remove('has-error');
    }

    // Tampilkan/sembunyikan password
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function () {
            const showPassword = passwordInput.type === 'password';
            passwordInput.type = showPassword ? 'text' : 'password';
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener('input', clearLoginError);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', clearLoginError);
    }

    if (loginForm && usernameInput && passwordInput) {
        loginForm.addEventListener('submit', async function (e) {
            // Mencegah form dikirim ke login_process.php
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username && !password) {
                showLoginError('Username dan password wajib diisi.', true, true);
                return;
            }

            if (!username) {
                showLoginError('Username wajib diisi.', true, false);
                return;
            }

            if (!password) {
                showLoginError('Password wajib diisi.', false, true);
                return;
            }

            const loginButton = loginForm.querySelector(
                'button[type="submit"], input[type="submit"]'
            );

            const originalText = loginButton
                ? (loginButton.tagName === 'INPUT'
                    ? loginButton.value
                    : loginButton.textContent)
                : '';

            try {
                clearLoginError();

                if (loginButton) {
                    loginButton.disabled = true;

                    if (loginButton.tagName === 'INPUT') {
                        loginButton.value = 'Memproses...';
                    } else {
                        loginButton.textContent = 'Memproses...';
                    }
                }

                const endpoint = '/KELOMPOK-5/api/auth/login.php';

                console.log('Mengirim login ke API:', endpoint);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                const result = await response.json();

                console.log('Respons login API:', response.status, result);

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Login gagal.');
                }

            const role = result.data?.role;

            if (role === 'owner') {
                simpanNotifikasiLogin('Login berhasil. Selamat datang erik');
                window.location.href = '/KELOMPOK-5/pages/dashboard.php';
            } else if (role === 'barber') {
                simpanNotifikasiLogin('Login berhasil. Selamat bekerja!');
                window.location.href = '/KELOMPOK-5/pages/transaksi.php';
            } else {
                throw new Error('Role akun tidak dikenali.');
            }
            } catch (error) {
                console.error('Login API gagal:', error);

                showLoginError(
                    error.message || 'Tidak dapat terhubung ke server.',
                    true,
                    true
                );
            } finally {
                if (loginButton) {
                    loginButton.disabled = false;

                    if (loginButton.tagName === 'INPUT') {
                        loginButton.value = originalText || 'Masuk';
                    } else {
                        loginButton.textContent = originalText || 'Masuk';
                    }
                }
            }
        });
    }



    // ======================================================
    // 2. VALIDASI FORM CATAT TRANSAKSI (JOB 4.1)
    // ======================================================
    const transaksiForm = document.getElementById('formTransaksi');
    if (transaksiForm) {
        transaksiForm.addEventListener('submit', function (e) {
            const layananDipilih = document.querySelectorAll('input[name="layanan[]"]:checked, input[name="id_layanan"]:checked');
            const layananSelect = document.getElementById('selectLayanan');
            const hasLayanan = (layananDipilih && layananDipilih.length > 0) || (layananSelect && layananSelect.value !== '');

            // Aturan A: Tidak ada layanan yang dipilih
            if (!hasLayanan) {
                e.preventDefault();
                showFieldError('errorLayanan', 'Pilih minimal satu layanan');
                return;
            }

            // Input Harga
            const hargaInput = document.getElementById('inputHarga');
            if (hargaInput) {
                const hargaVal = hargaInput.value.trim();

                // Aturan B: Harga kosong
                if (hargaVal === '') {
                    e.preventDefault();
                    showFieldError('errorHarga', 'Harga wajib diisi');
                    hargaInput.classList.add('is-invalid');
                    return;
                }

                // Aturan C: Harga bukan angka
                const numericHarga = Number(hargaVal.replace(/[^0-9.-]+/g, ''));
                if (isNaN(numericHarga) || !/^\d+$/.test(hargaVal.replace(/\./g, ''))) {
                    e.preventDefault();
                    showFieldError('errorHarga', 'Harga harus berupa angka');
                    hargaInput.classList.add('is-invalid');
                    return;
                }

                // Aturan D: Harga berbeda dari harga layanan (Konfirmasi Modal)
                const baseHarga = Number(hargaInput.getAttribute('data-base-price') || 0);
                const isConfirmed = transaksiForm.getAttribute('data-price-confirmed') === 'true';

                if (baseHarga > 0 && numericHarga !== baseHarga && !isConfirmed) {
                    e.preventDefault();
                    openPriceConfirmModal(function onConfirm() {
                        transaksiForm.setAttribute('data-price-confirmed', 'true');
                        transaksiForm.submit();
                    });
                    return;
                }
            }
        });
    }


    // ======================================================
    // 3. VALIDASI FORM PELANGGAN
    // ======================================================
    const formPelanggan = document.getElementById('formPelanggan');
    if (formPelanggan) {
        formPelanggan.addEventListener('submit', function (e) {
            const namaInput = document.getElementById('namaPelanggan');
            const hpInput = document.getElementById('noHpPelanggan');

            let isValid = true;

            // A. Nama kosong
            if (namaInput && namaInput.value.trim() === '') {
                e.preventDefault();
                showFieldError('errorNamaPelanggan', 'Nama pelanggan wajib diisi');
                namaInput.classList.add('is-invalid');
                isValid = false;
            }

            // B & C. Nomor HP
            if (hpInput) {
                const hpVal = hpInput.value.trim();
                if (hpVal === '') {
                    e.preventDefault();
                    showFieldError('errorHpPelanggan', 'Nomor HP wajib diisi');
                    hpInput.classList.add('is-invalid');
                    isValid = false;
                } else if (!/^[0-9+\-\s]{8,18}$/.test(hpVal)) {
                    e.preventDefault();
                    showFieldError('errorHpPelanggan', 'Nomor HP tidak valid');
                    hpInput.classList.add('is-invalid');
                    isValid = false;
                }
            }

            return isValid;
        });
    }


    // ======================================================
    // 4. VALIDASI FORM LAYANAN
    // ======================================================
    const formLayanan = document.getElementById('formLayanan');
    if (formLayanan) {
        formLayanan.addEventListener('submit', function (e) {
            const namaLayanan = document.getElementById('namaLayanan');
            const hargaLayanan = document.getElementById('hargaLayanan');

            if (namaLayanan && namaLayanan.value.trim() === '') {
                e.preventDefault();
                showFieldError('errorNamaLayanan', 'Nama layanan wajib diisi');
                namaLayanan.classList.add('is-invalid');
                return;
            }

            if (hargaLayanan) {
                const hVal = hargaLayanan.value.trim();
                if (hVal === '') {
                    e.preventDefault();
                    showFieldError('errorHargaLayanan', 'Harga wajib diisi');
                    hargaLayanan.classList.add('is-invalid');
                    return;
                }

                const numH = Number(hVal.replace(/[^0-9.-]+/g, ''));
                if (isNaN(numH) || !/^\d+$/.test(hVal.replace(/\./g, ''))) {
                    e.preventDefault();
                    showFieldError('errorHargaLayanan', 'Harga harus berupa angka');
                    hargaLayanan.classList.add('is-invalid');
                    return;
                }

                if (numH <= 0) {
                    e.preventDefault();
                    showFieldError('errorHargaLayanan', 'Harga harus lebih dari 0');
                    hargaLayanan.classList.add('is-invalid');
                    return;
                }
            }
        });
    }


    // ======================================================
    // 5. VALIDASI FORM PENGELUARAN / HPP
    // ======================================================
    const formPengeluaran = document.getElementById('formPengeluaran');
    if (formPengeluaran) {
        formPengeluaran.addEventListener('submit', function (e) {
            const kategori = document.getElementById('kategoriPengeluaran');
            const nominal = document.getElementById('nominalPengeluaran');

            if (kategori && (kategori.value === '' || kategori.value === 'pilih')) {
                e.preventDefault();
                showFieldError('errorKategori', 'Kategori wajib dipilih');
                kategori.classList.add('is-invalid');
                return;
            }

            if (nominal) {
                const nVal = nominal.value.trim();
                if (nVal === '') {
                    e.preventDefault();
                    showFieldError('errorNominal', 'Nominal wajib diisi');
                    nominal.classList.add('is-invalid');
                    return;
                }

                const numN = Number(nVal.replace(/[^0-9.-]+/g, ''));
                if (isNaN(numN) || !/^\d+$/.test(nVal.replace(/\./g, ''))) {
                    e.preventDefault();
                    showFieldError('errorNominal', 'Nominal harus berupa angka');
                    nominal.classList.add('is-invalid');
                    return;
                }

                if (numN <= 0) {
                    e.preventDefault();
                    showFieldError('errorNominal', 'Nominal harus lebih dari 0');
                    nominal.classList.add('is-invalid');
                    return;
                }
            }
        });
    }





    // ======================================================
    // UTILITY: SHOW ERROR HELPER
    // ======================================================
    function showFieldError(targetId, message) {
        const errEl = document.getElementById(targetId);
        if (errEl) {
            errEl.textContent = '*' + message;
            errEl.style.display = 'block';
        } else {
            alert(message);
        }
    }


    // ======================================================
    // MODAL DIALOG KONFIRMASI HARGA BERBEDA (JOB 4.1 AC2)
    // ======================================================
    function openPriceConfirmModal(onConfirmCallback) {
        let modalEl = document.getElementById('modalKonfirmasiHarga');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'modalKonfirmasiHarga';
            modalEl.className = 'kataji-modal-overlay';
            modalEl.innerHTML = `
                <div class="kataji-modal-box">
                    <div class="kataji-modal-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D99B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h3>Konfirmasi Perubahan Harga</h3>
                    <p>Harga berbeda dari harga layanan. Apakah Anda yakin ingin menyimpan transaksi dengan harga ini?</p>
                    <div class="kataji-modal-actions">
                        <button type="button" id="btnBatalHarga" class="btn-modal-cancel">Batalkan</button>
                        <button type="button" id="btnSimpanHarga" class="btn-modal-confirm">Ya, Simpan</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
        }

        modalEl.style.display = 'flex';

        const btnBatal = document.getElementById('btnBatalHarga');
        const btnSimpan = document.getElementById('btnSimpanHarga');

        btnBatal.onclick = function () {
            modalEl.style.display = 'none';
        };

        btnSimpan.onclick = function () {
            modalEl.style.display = 'none';
            if (typeof onConfirmCallback === 'function') {
                onConfirmCallback();
            }
        };
    }

    
    // ======================================================
    // AMBIL DAFTAR LAYANAN DARI API BACKEND
    // ======================================================


async function muatLayananDariAPI() {
    const container = document.querySelector('.kasir-services');
    if (!container) return;

    try {
        const response = await fetch(
            '/KELOMPOK-5/api/layanan/index.php',
            {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Gagal memuat layanan.');
        }

    

        const gambarLayanan = {};

        container.querySelectorAll('.service-card').forEach(kartu => {
            const nama = kartu.dataset.service;
            const gambar = kartu.querySelector('.service-icon img');

            if (nama && gambar) {
                gambarLayanan[nama] = gambar.src;
            }
        });

console.log('Gambar layanan tersimpan:', gambarLayanan);


        container.innerHTML = '';

        if (!Array.isArray(result.data) || result.data.length === 0) {
            container.textContent = 'Belum ada layanan aktif.';
            return;
        }

        result.data.forEach(layanan => {
            const kartu = document.createElement('button');
            kartu.type = 'button';
            kartu.className = 'service-card';

            // Ambil ID, nama, dan harga dari database
            kartu.dataset.idLayanan = String(layanan.id_layanan);
            kartu.dataset.service = String(layanan.nama_layanan);
            kartu.dataset.price = String(layanan.harga);

            
const ikon = document.createElement('span');
ikon.className = 'service-icon';

const gambar = document.createElement('img');
gambar.src = gambarLayanan[layanan.nama_layanan] || '';
gambar.alt = layanan.nama_layanan;

ikon.appendChild(gambar);

            const info = document.createElement('span');
            info.className = 'service-info';

            const nama = document.createElement('strong');
            nama.textContent = layanan.nama_layanan;

            const harga = document.createElement('small');
            harga.textContent =
                'Rp' + Number(layanan.harga).toLocaleString('id-ID');

            info.append(nama, harga);
            kartu.append(ikon, info);
            container.appendChild(kartu);
        });

        console.log('Layanan berhasil dimuat:', result.data);
    } catch (error) {
        console.error('Gagal memuat layanan:', error);
        container.textContent = 'Gagal memuat layanan. Silakan muat ulang halaman.';
    }
}

muatLayananDariAPI();


        // Memuat daftar barber dari API
        async function muatBarberDariAPI() {
            const selectBarber = document.getElementById('namaBarber');

            if (!selectBarber) return;

            try {
                const response = await fetch(
                    '/KELOMPOK-5/api/barber/index.php',
                    {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: {
                            'Accept': 'application/json'
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || 'Gagal mengambil daftar barber.'
                    );
                }

                // Pertahankan placeholder dropdown
                selectBarber.innerHTML =
                    '<option value="">Ketik disini...</option>';

                result.data.forEach(barber => {
                    const option = document.createElement('option');
                    option.value = barber.id_user;
                    option.textContent = barber.nama;
                    selectBarber.appendChild(option);
                });

            } catch (error) {
                console.error('Gagal memuat barber:', error);
            }
        }

        // Panggil API untuk memuat daftar barber
        muatBarberDariAPI();


   
    // ======================================================
    // 6. INTERAKSI KASIR - PILIH LAYANAN
    // ======================================================

    const servicesContainer = document.querySelector('.kasir-services');
    const selectedServicesContainer = document.getElementById('selectedServices');
    const kasirTotal = document.getElementById('kasirTotal');
    const selectedServices = {};

    function formatRupiah(value) {
        return 'Rp' + Number(value).toLocaleString('id-ID');
    }

    function renderSelectedServices() {
        if (!selectedServicesContainer || !kasirTotal) return;

        const items = Object.values(selectedServices);
        let total = 0;

        if (items.length === 0) {
            selectedServicesContainer.innerHTML =
                '<p class="empty-service">Belum ada layanan dipilih</p>';
        } else {
            selectedServicesContainer.innerHTML = items.map(item => {
                const subtotal = item.price * item.qty;
                total += subtotal;

                return `
                    <div class="selected-service-row">
                        <span>${item.name} ${item.qty}x</span>
                        <span>${formatRupiah(subtotal)}</span>
                        <button type="button"
                            data-action="remove"
                            data-id-layanan="${item.id_layanan}">×</button>
                    </div>
                `;
            }).join('');
        }

        kasirTotal.textContent = formatRupiah(total);

        if (servicesContainer) {
            servicesContainer.querySelectorAll('.service-card').forEach(card => {
                card.classList.toggle(
                    'selected',
                    Boolean(selectedServices[String(card.dataset.idLayanan)])
                );
            });
        }
    }

    if (servicesContainer) {
        servicesContainer.addEventListener('click', function (e) {
            const card = e.target.closest('.service-card');
            if (!card) return;

            const id = String(card.dataset.idLayanan || '');
            const name = card.dataset.service;
            const price = Number(card.dataset.price);

            console.log('ID layanan:', id);
            console.log('Nama layanan:', name);
            console.log('Harga layanan:', price);

            console.log('Data kartu layanan:', {
                id,
                name,
                price,
                kartu: card
            });

            if (!id || !name || !Number.isFinite(price)) {
                alert('Data layanan tidak valid.');
                return;
            }


            if (selectedServices[id]) {
                delete selectedServices[id];
            } else {
                selectedServices[id] = {
                    id_layanan: Number(id),
                    name,
                    price,
                    qty: 1
                };
            }

            renderSelectedServices();

        });
    }

    if (selectedServicesContainer) {
        selectedServicesContainer.addEventListener('click', function (e) {
            const button = e.target.closest('[data-action="remove"]');
            if (!button) return;

            delete selectedServices[String(button.dataset.idLayanan)];
            renderSelectedServices();
        });
    }

    renderSelectedServices();

    

// ======================================================
// 7. SIMPAN TRANSAKSI KE API BACKEND
// ======================================================

const btnSimpanTransaksi = document.getElementById('btnSimpanTransaksi');

if (btnSimpanTransaksi) {
    btnSimpanTransaksi.addEventListener('click', async function () {
        const namaPelanggan = document.getElementById('namaPelanggan');
        const namaBarber = document.getElementById('namaBarber');
        const metodePembayaran = document.getElementById('metodePembayaran');

        const layanan = Object.values(selectedServices).map(item => ({
            id_layanan: item.id_layanan,
            jumlah: item.qty
        }));

        // Validasi nama pelanggan
        if (!namaPelanggan || !namaPelanggan.value.trim()) {
            alert('Nama pelanggan wajib diisi!');
            namaPelanggan?.focus();
            return;
        }

        // Validasi barber
        if (!namaBarber || !namaBarber.value) {
            alert('Nama barber wajib dipilih!');
            namaBarber?.focus();
            return;
        }

        // Validasi layanan
        if (layanan.length === 0) {
            alert('Pilih minimal satu layanan!');
            return;
        }

        // Validasi metode pembayaran
        if (!metodePembayaran || !metodePembayaran.value) {
            alert('Metode pembayaran wajib dipilih!');
            metodePembayaran?.focus();
            return;
        }

        btnSimpanTransaksi.disabled = true;

        try {
            const response = await fetch(
                '/KELOMPOK-5/api/transaksi/index.php',
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    

                body: JSON.stringify({
                    nama_pelanggan: namaPelanggan.value.trim(),
                    id_barber: Number(namaBarber.value),
                    layanan: layanan,
                    metode_pembayaran: metodePembayaran.value
                })


                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Transaksi gagal disimpan.'
                );
            }

            alert(
                'Transaksi berhasil disimpan!\nTotal: ' +
                formatRupiah(result.data.total_harga)
            );

            // Kosongkan pilihan setelah API berhasil menyimpan
            Object.keys(selectedServices).forEach(id => {
                delete selectedServices[id];
            });

            namaPelanggan.value = '';
            namaBarber.value = '';
            metodePembayaran.value = '';

            renderSelectedServices();

        } catch (error) {
            console.error('Gagal menyimpan transaksi:', error);
            alert(error.message || 'Terjadi kesalahan saat menyimpan transaksi.');
        } finally {
            btnSimpanTransaksi.disabled = false;
        }
    });
}



});