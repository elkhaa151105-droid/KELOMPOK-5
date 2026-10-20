/**
 * Kataji Barber - Frontend Validation & Interactivity
 * Role: Faqih Huddin SM (Frontend Developer)
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("SCRIPT KATAJI TERLOAD");

  // ======================================================
  // 1. VALIDASI FORM LOGIN
  // ======================================================
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const usernameWrapper = document.getElementById("usernameWrapper");
  const passwordWrapper = document.getElementById("passwordWrapper");
  const loginErrorMessage = document.getElementById("loginErrorMessage");
  const passwordToggle = document.getElementById("passwordToggle");

  const loginNotification = document.querySelector(".login-notification");

  if (loginNotification) {
    setTimeout(() => {
      loginNotification.classList.remove("show");
    }, 2500);
  }

  // Toggle Password Visibility
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", function () {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

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
    usernameInput.addEventListener("input", function () {
      if (usernameWrapper) usernameWrapper.classList.remove("has-error");
      clearLoginErrorIfResolved();
    });
  }
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      if (passwordWrapper) passwordWrapper.classList.remove("has-error");
      clearLoginErrorIfResolved();
    });
  }

  function clearLoginErrorIfResolved() {
    if (loginErrorMessage) {
      const uVal = usernameInput ? usernameInput.value.trim() : "";
      const pVal = passwordInput ? passwordInput.value : "";
      if (uVal !== "" && pVal !== "") {
        loginErrorMessage.textContent = "";
        loginErrorMessage.style.display = "none";
      }
    }
  }

  // Handler Submit Form Login
  if (loginForm && usernameInput && passwordInput) {
    loginForm.addEventListener("submit", function (e) {
      const usernameVal = usernameInput.value.trim();
      const passwordVal = passwordInput.value;

      // Aturan A: Username dan password kosong
      if (usernameVal === "" && passwordVal === "") {
        e.preventDefault();
        showLoginError("Username/email dan password wajib diisi", true, true);
        return;
      }

      // Aturan B: Username kosong, password diisi
      if (usernameVal === "") {
        e.preventDefault();
        showLoginError("Username/email wajib diisi", true, false);
        return;
      }

      // Aturan C: Username diisi, password kosong
      if (passwordVal === "") {
        e.preventDefault();
        showLoginError("Password wajib diisi", false, true);
        return;
      }

      // Jika validasi client lolos, biarkan form submit ke backend
    });
  }

  function showLoginError(msg, errorUser, errorPass) {
    if (loginErrorMessage) {
      loginErrorMessage.textContent = "*" + msg;
      loginErrorMessage.style.display = "block";
    }
    if (usernameWrapper) {
      if (errorUser) {
        usernameWrapper.classList.add("has-error");
      } else {
        usernameWrapper.classList.remove("has-error");
      }
    }
    if (passwordWrapper) {
      if (errorPass) {
        passwordWrapper.classList.add("has-error");
      } else {
        passwordWrapper.classList.remove("has-error");
      }
    }
  }

  // ======================================================
  // 2. VALIDASI FORM CATAT TRANSAKSI (JOB 4.1)
  // ======================================================
  const transaksiForm = document.getElementById("formTransaksi");
  if (transaksiForm) {
    transaksiForm.addEventListener("submit", function (e) {
      const layananDipilih = document.querySelectorAll(
        'input[name="layanan[]"]:checked, input[name="id_layanan"]:checked',
      );
      const layananSelect = document.getElementById("selectLayanan");
      const hasLayanan =
        (layananDipilih && layananDipilih.length > 0) ||
        (layananSelect && layananSelect.value !== "");

      // Aturan A: Tidak ada layanan yang dipilih
      if (!hasLayanan) {
        e.preventDefault();
        showFieldError("errorLayanan", "Pilih minimal satu layanan");
        return;
      }

      // Input Harga
      const hargaInput = document.getElementById("inputHarga");
      if (hargaInput) {
        const hargaVal = hargaInput.value.trim();

        // Aturan B: Harga kosong
        if (hargaVal === "") {
          e.preventDefault();
          showFieldError("errorHarga", "Harga wajib diisi");
          hargaInput.classList.add("is-invalid");
          return;
        }

        // Aturan C: Harga bukan angka
        const numericHarga = Number(hargaVal.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numericHarga) || !/^\d+$/.test(hargaVal.replace(/\./g, ""))) {
          e.preventDefault();
          showFieldError("errorHarga", "Harga harus berupa angka");
          hargaInput.classList.add("is-invalid");
          return;
        }

        // Aturan D: Harga berbeda dari harga layanan (Konfirmasi Modal)
        const baseHarga = Number(
          hargaInput.getAttribute("data-base-price") || 0,
        );
        const isConfirmed =
          transaksiForm.getAttribute("data-price-confirmed") === "true";

        if (baseHarga > 0 && numericHarga !== baseHarga && !isConfirmed) {
          e.preventDefault();
          openPriceConfirmModal(function onConfirm() {
            transaksiForm.setAttribute("data-price-confirmed", "true");
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
  const formPelanggan = document.getElementById("formPelanggan");
  if (formPelanggan) {
    formPelanggan.addEventListener("submit", function (e) {
      const namaInput = document.getElementById("namaPelanggan");
      const hpInput = document.getElementById("noHpPelanggan");

      let isValid = true;

      // A. Nama kosong
      if (namaInput && namaInput.value.trim() === "") {
        e.preventDefault();
        showFieldError("errorNamaPelanggan", "Nama pelanggan wajib diisi");
        namaInput.classList.add("is-invalid");
        isValid = false;
      }

      // B & C. Nomor HP
      if (hpInput) {
        const hpVal = hpInput.value.trim();
        if (hpVal === "") {
          e.preventDefault();
          showFieldError("errorHpPelanggan", "Nomor HP wajib diisi");
          hpInput.classList.add("is-invalid");
          isValid = false;
        } else if (!/^[0-9+\-\s]{8,18}$/.test(hpVal)) {
          e.preventDefault();
          showFieldError("errorHpPelanggan", "Nomor HP tidak valid");
          hpInput.classList.add("is-invalid");
          isValid = false;
        }
      }

      return isValid;
    });
  }

  // ======================================================
  // 4. VALIDASI FORM LAYANAN
  // ======================================================
  const formLayanan = document.getElementById("formLayanan");
  if (formLayanan) {
    formLayanan.addEventListener("submit", function (e) {
      const namaLayanan = document.getElementById("namaLayanan");
      const hargaLayanan = document.getElementById("hargaLayanan");

      if (namaLayanan && namaLayanan.value.trim() === "") {
        e.preventDefault();
        showFieldError("errorNamaLayanan", "Nama layanan wajib diisi");
        namaLayanan.classList.add("is-invalid");
        return;
      }

      if (hargaLayanan) {
        const hVal = hargaLayanan.value.trim();
        if (hVal === "") {
          e.preventDefault();
          showFieldError("errorHargaLayanan", "Harga wajib diisi");
          hargaLayanan.classList.add("is-invalid");
          return;
        }

        const numH = Number(hVal.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numH) || !/^\d+$/.test(hVal.replace(/\./g, ""))) {
          e.preventDefault();
          showFieldError("errorHargaLayanan", "Harga harus berupa angka");
          hargaLayanan.classList.add("is-invalid");
          return;
        }

        if (numH <= 0) {
          e.preventDefault();
          showFieldError("errorHargaLayanan", "Harga harus lebih dari 0");
          hargaLayanan.classList.add("is-invalid");
          return;
        }
      }
    });
  }

  // ======================================================
  // 5. VALIDASI FORM PENGELUARAN / HPP
  // ======================================================
  const formPengeluaran = document.getElementById("formPengeluaran");
  if (formPengeluaran) {
    formPengeluaran.addEventListener("submit", function (e) {
      const kategori = document.getElementById("kategoriPengeluaran");
      const nominal = document.getElementById("nominalPengeluaran");

      if (kategori && (kategori.value === "" || kategori.value === "pilih")) {
        e.preventDefault();
        showFieldError("errorKategori", "Kategori wajib dipilih");
        kategori.classList.add("is-invalid");
        return;
      }

      if (nominal) {
        const nVal = nominal.value.trim();
        if (nVal === "") {
          e.preventDefault();
          showFieldError("errorNominal", "Nominal wajib diisi");
          nominal.classList.add("is-invalid");
          return;
        }

        const numN = Number(nVal.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numN) || !/^\d+$/.test(nVal.replace(/\./g, ""))) {
          e.preventDefault();
          showFieldError("errorNominal", "Nominal harus berupa angka");
          nominal.classList.add("is-invalid");
          return;
        }

        if (numN <= 0) {
          e.preventDefault();
          showFieldError("errorNominal", "Nominal harus lebih dari 0");
          nominal.classList.add("is-invalid");
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
      errEl.textContent = "*" + message;
      errEl.style.display = "block";
    } else {
      alert(message);
    }
  }

  // ======================================================
  // MODAL DIALOG KONFIRMASI HARGA BERBEDA (JOB 4.1 AC2)
  // ======================================================
  function openPriceConfirmModal(onConfirmCallback) {
    let modalEl = document.getElementById("modalKonfirmasiHarga");
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = "modalKonfirmasiHarga";
      modalEl.className = "kataji-modal-overlay";
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

    modalEl.style.display = "flex";

    const btnBatal = document.getElementById("btnBatalHarga");
    const btnSimpan = document.getElementById("btnSimpanHarga");

    btnBatal.onclick = function () {
      modalEl.style.display = "none";
    };

    btnSimpan.onclick = function () {
      modalEl.style.display = "none";
      if (typeof onConfirmCallback === "function") {
        onConfirmCallback();
      }
    };
  }

  // ======================================================
  // AUTOCOMPLETE PELANGGAN KASIR
  // ======================================================
  const namaPelangganInput = document.getElementById("namaPelanggan");
  const idPelangganInput = document.getElementById("idPelanggan");
  const saranPelanggan = document.getElementById("saranPelanggan");

  if (namaPelangganInput && idPelangganInput && saranPelanggan) {
    let requestPelanggan = 0;

    function tutupSaranPelanggan() {
      saranPelanggan.replaceChildren();
      saranPelanggan.hidden = true;
    }

    namaPelangganInput.addEventListener("input", async () => {
      idPelangganInput.value = "";

      const q = namaPelangganInput.value.trim();
      const requestSaatIni = ++requestPelanggan;

      tutupSaranPelanggan();
      if (q.length < 2) return;

      try {
        const response = await fetch(
          `/KELOMPOK-5/api/pelanggan/index.php?q=${encodeURIComponent(q)}`,
          {
            method: "GET",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) return;

        const hasil = await response.json();

        if (requestSaatIni !== requestPelanggan) return;
        if (!hasil.success || !Array.isArray(hasil.data)) return;

        hasil.data.forEach((pelanggan) => {
          const tombol = document.createElement("button");
          tombol.type = "button";
          tombol.className = "customer-suggestion";
          tombol.setAttribute("role", "option");

          const nama = document.createElement("span");
          nama.textContent = pelanggan.nama || "";

          const noHp = document.createElement("small");
          noHp.textContent = pelanggan.no_hp || "";

          tombol.append(nama, noHp);

          tombol.addEventListener("click", () => {
            namaPelangganInput.value = pelanggan.nama || "";
            idPelangganInput.value = String(pelanggan.id_pelanggan);
            tutupSaranPelanggan();
          });

          saranPelanggan.appendChild(tombol);
        });

        if (hasil.data.length > 0) {
          saranPelanggan.hidden = false;
        }
      } catch (error) {
        console.error("Gagal mencari pelanggan:", error);
        tutupSaranPelanggan();
      }
    });

    namaPelangganInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        tutupSaranPelanggan();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !saranPelanggan.contains(event.target) &&
        event.target !== namaPelangganInput
      ) {
        tutupSaranPelanggan();
      }
    });
  }

  // ======================================================
  // 6. INTERAKSI KASIR - PILIH LAYANAN (JOB 4.1)
  // ======================================================

  // INTERAKSI KASIR: pilihan ini dikirim sebagai form ke backend PHP.
  const kasirForm = document.getElementById("kasirForm");

  if (kasirForm) {
    const serviceCards = [
      ...kasirForm.querySelectorAll(".service-card[data-service-id]"),
    ];
    const selectedServicesContainer =
      document.getElementById("selectedServices");
    const hiddenServicesContainer = document.getElementById(
      "kasirHiddenServices",
    );
    const kasirTotal = document.getElementById("kasirTotal");
    const kasirError = document.getElementById("kasirError");
    const saveButton = document.getElementById("btnSimpanTransaksi");
    const selectedServices = new Map();

    function formatRupiah(value) {
      return "Rp" + Number(value).toLocaleString("id-ID");
    }

    function makeButton(label, action, serviceId, ariaLabel, className = "") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.dataset.action = action;
      button.dataset.serviceId = serviceId;
      button.setAttribute("aria-label", ariaLabel);
      button.textContent = label;
      return button;
    }

    function renderSelectedServices() {
      selectedServicesContainer.replaceChildren();
      hiddenServicesContainer.replaceChildren();

      let total = 0;
      for (const [id, item] of selectedServices) {
        const subtotal = item.price * item.qty;
        total += subtotal;

        const row = document.createElement("div");
        row.className = "selected-service-row";

        const name = document.createElement("span");
        name.className = "selected-service-name";
        name.textContent = item.name;

        const quantity = document.createElement("span");
        quantity.className = "selected-service-quantity";
        quantity.append(
          makeButton(
            "-",
            "decrease",
            id,
            `Kurangi ${item.name}`,
            "selected-service-qty-button",
          ),
        );
        const quantityValue = document.createElement("span");
        quantityValue.textContent = `${item.qty}x`;
        quantity.append(quantityValue);
        quantity.append(
          makeButton(
            "+",
            "increase",
            id,
            `Tambah ${item.name}`,
            "selected-service-qty-button",
          ),
        );

        const subtotalNode = document.createElement("span");
        subtotalNode.textContent = formatRupiah(subtotal);

        row.append(
          name,
          quantity,
          subtotalNode,
          makeButton(
            "\u00D7",
            "remove",
            id,
            `Hapus ${item.name}`,
            "selected-service-remove",
          ),
        );
        selectedServicesContainer.append(row);

        const serviceInput = document.createElement("input");
        serviceInput.type = "hidden";
        serviceInput.name = "layanan[]";
        serviceInput.value = id;

        const quantityInput = document.createElement("input");
        quantityInput.type = "hidden";
        quantityInput.name = `jumlah[${id}]`;
        quantityInput.value = String(item.qty);
        hiddenServicesContainer.append(serviceInput, quantityInput);
      }

      if (selectedServices.size === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-service";
        empty.textContent = "Belum ada layanan dipilih";
        selectedServicesContainer.append(empty);
      }

      kasirTotal.textContent = formatRupiah(total);
      serviceCards.forEach((card) => {
        const isSelected = selectedServices.has(card.dataset.serviceId);
        card.classList.toggle("selected", isSelected);
        card.setAttribute("aria-pressed", String(isSelected));
      });
    }

    serviceCards.forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.serviceId;

        if (selectedServices.has(id)) {
          selectedServices.delete(id);
        } else {
          selectedServices.set(id, {
            name: card.dataset.serviceName,
            price: Number(card.dataset.price),
            qty: 1,
          });
        }

        renderSelectedServices();
      });
    });

    selectedServicesContainer.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      const id = button.dataset.serviceId;
      const item = selectedServices.get(id);
      if (!item) return;

      if (button.dataset.action === "remove") {
        selectedServices.delete(id);
      } else if (button.dataset.action === "decrease") {
        item.qty -= 1;
        if (item.qty < 1) selectedServices.delete(id);
      } else if (button.dataset.action === "increase") {
        item.qty = Math.min(item.qty + 1, 100);
      }
      renderSelectedServices();
    });

    kasirForm.addEventListener("submit", (event) => {
      kasirError.hidden = true;
      const namaPelanggan = kasirForm.elements.nama_pelanggan;
      if (!namaPelanggan.value.trim()) {
        event.preventDefault();
        alert("Nama pelanggan wajib diisi!");
        namaPelanggan.focus();
        return;
      }

      if (selectedServices.size === 0) {
        event.preventDefault();
        kasirError.textContent = "Pilih minimal satu layanan.";
        kasirError.hidden = false;
        return;
      }

      if (!kasirForm.elements.id_barber.value) {
        event.preventDefault();
        kasirError.textContent = "Pilih barber yang melayani.";
        kasirError.hidden = false;
        kasirForm.elements.id_barber.focus();
        return;
      }

      if (!kasirForm.elements.metode_pembayaran.value) {
        event.preventDefault();
        kasirError.textContent = "Pilih metode pembayaran.";
        kasirError.hidden = false;
        kasirForm.elements.metode_pembayaran.focus();
        return;
      }

      saveButton.disabled = true;
      saveButton.textContent = "Menyimpan...";
    });
  }
});
