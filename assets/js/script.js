/**
 * Kataji Barber - Frontend Validation & Interactivity
 * Role: Faqih Huddin SM (Frontend Developer)
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('SCRIPT KATAJI TERLOAD');

    // ======================================================
    // 1. VALIDASI FORM LOGIN
    // ======================================================
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameWrapper = document.getElementById('usernameWrapper');
    const passwordWrapper = document.getElementById('passwordWrapper');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const passwordToggle = document.getElementById('passwordToggle');

    // Toggle Password Visibility
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function () {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

            if (isPassword) {
                passwordToggle.innerHTML = `
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                passwordToggle.innerHTML = `
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    }

    // Pembersihan pesan error saat user mengetik
    if (usernameInput) {
        usernameInput.addEventListener('input', function () {
            if (usernameWrapper) usernameWrapper.classList.remove('has-error');
            clearLoginErrorIfResolved();
        });
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            if (passwordWrapper) passwordWrapper.classList.remove('has-error');
            clearLoginErrorIfResolved();
        });
    }

    function clearLoginErrorIfResolved() {
        if (loginErrorMessage) {
            const uVal = usernameInput ? usernameInput.value.trim() : '';
            const pVal = passwordInput ? passwordInput.value : '';
            if (uVal !== '' && pVal !== '') {
                loginErrorMessage.textContent = '';
                loginErrorMessage.style.display = 'none';
            }
        }
    }

    // Handler Submit Form Login
    if (loginForm && usernameInput && passwordInput) {
        loginForm.addEventListener('submit', function (e) {
            const usernameVal = usernameInput.value.trim();
            const passwordVal = passwordInput.value;

            // Aturan A: Username dan password kosong
            if (usernameVal === '' && passwordVal === '') {
                e.preventDefault();
                showLoginError('Username/email dan password wajib diisi', true, true);
                return;
            }

            // Aturan B: Username kosong, password diisi
            if (usernameVal === '') {
                e.preventDefault();
                showLoginError('Username/email wajib diisi', true, false);
                return;
            }

            // Aturan C: Username diisi, password kosong
            if (passwordVal === '') {
                e.preventDefault();
                showLoginError('Password wajib diisi', false, true);
                return;
            }

            // Jika validasi client lolos, biarkan form submit ke backend
        });
    }

    function showLoginError(msg, errorUser, errorPass) {
        if (loginErrorMessage) {
            loginErrorMessage.textContent = '*' + msg;
            loginErrorMessage.style.display = 'block';
        }
        if (usernameWrapper) {
            if (errorUser) {
                usernameWrapper.classList.add('has-error');
            } else {
                usernameWrapper.classList.remove('has-error');
            }
        }
        if (passwordWrapper) {
            if (errorPass) {
                passwordWrapper.classList.add('has-error');
            } else {
                passwordWrapper.classList.remove('has-error');
            }
        }
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
// 6. INTERAKSI KASIR - PILIH LAYANAN (JOB 4.1)
// ======================================================

const serviceCards = document.querySelectorAll('.service-card');
const selectedServicesContainer = document.getElementById('selectedServices');
const kasirTotal = document.getElementById('kasirTotal');

console.log('Jumlah service:', serviceCards.length);
console.log('selectedServices:', selectedServicesContainer);
console.log('kasirTotal:', kasirTotal);

// Menyimpan layanan yang dipilih
const selectedServices = {};

// Format angka menjadi Rupiah
function formatRupiah(value) {
    return 'Rp' + Number(value).toLocaleString('id-ID');
}

// Menampilkan layanan yang dipilih
function renderSelectedServices() {
    if (!selectedServicesContainer || !kasirTotal) return;

    const items = Object.values(selectedServices);

    // Jika belum ada layanan
    if (items.length === 0) {
        selectedServicesContainer.innerHTML = `
            <p class="empty-service">Belum ada layanan dipilih</p>
        `;

        kasirTotal.textContent = 'Rp0';

        serviceCards.forEach(card => {
            card.classList.remove('selected');
        });

        return;
    }

    let total = 0;

    selectedServicesContainer.innerHTML = items.map(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        return `
            <div class="selected-service-row" data-service="${item.name}">
                <span>${item.name} ${item.qty}x</span>
                <span>${formatRupiah(subtotal)}</span>
                <button
                    type="button"
                    class="selected-service-remove"
                    data-action="remove"
                    data-service="${item.name}"
                    aria-label="Hapus ${item.name}">
                    ×
                </button>
            </div>
        `;
    }).join('');

    // Tampilkan total
    kasirTotal.textContent = formatRupiah(total);

    // Tandai card layanan yang sedang dipilih
    serviceCards.forEach(card => {
        const serviceName = card.dataset.service;

        if (selectedServices[serviceName]) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Notifikasi transaksi berhasil
function showSuccessNotification() {
    const notification = document.createElement('div');

    notification.className = 'transaction-success';
    notification.textContent = 'Transaksi Berhasil';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');

        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2500);
}

// Klik layanan
serviceCards.forEach(card => {
    card.addEventListener('click', function () {

        const serviceName = this.dataset.service;
        const servicePrice = Number(this.dataset.price);

        console.log('Service diklik:', serviceName, servicePrice);

        // Jika layanan sudah dipilih, quantity bertambah
        if (selectedServices[serviceName]) {
            selectedServices[serviceName].qty += 1;
        } 
        
        // Jika belum dipilih, tambahkan sebagai layanan baru
        else {
            selectedServices[serviceName] = {
                name: serviceName,
                price: servicePrice,
                qty: 1
            };
        }

        renderSelectedServices();
    });
});


// Hapus layanan dari daftar
if (selectedServicesContainer) {
    selectedServicesContainer.addEventListener('click', function (e) {

        const removeButton = e.target.closest('[data-action="remove"]');

        if (!removeButton) return;

        const serviceName = removeButton.dataset.service;

        delete selectedServices[serviceName];

        renderSelectedServices();
    });
}

const btnSimpanTransaksi = document.getElementById('btnSimpanTransaksi');

if (btnSimpanTransaksi) {
    btnSimpanTransaksi.addEventListener('click', function () {

        // Validasi: layanan wajib dipilih
        if (Object.keys(selectedServices).length === 0) {
            alert('Pilih minimal satu layanan');
            return;
        }

        // Tampilkan notifikasi transaksi berhasil
        showSuccessNotification();

        // Kosongkan layanan yang sudah dipilih
        Object.keys(selectedServices).forEach(serviceName => {
            delete selectedServices[serviceName];
        });

        // Perbarui tampilan kasir
        renderSelectedServices();
    });
}

});