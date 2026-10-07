<?php

require_once __DIR__ . '/../includes/auth_check.php';

require_login();

?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="kasir-page">

    <!-- HEADER -->
    <div class="kasir-heading">
        <h1>Kasir</h1>
        <p>Pricelist - Klik untuk tambah (hanya layanan aktif)</p>
    </div>

    <div class="kasir-layout">

        <!-- DAFTAR LAYANAN -->
        <section class="kasir-services">

            <button
                type="button"
                class="service-card"
                data-service="Haircut"
                data-price="50000"
            >
                <span class="service-icon">
                   <img 
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADS0lEQVR4nO2YW4hNURjHf+NukNsIoVGjEKLc3qiRB/cHmZJbNPIyHqXcXlAo1yQjXjxMLpOSCREiIeRB5JL75DbGyCDEzNGq/67d6ex91trnnDlH7X+tl73WXt9/rfV93/p/C2LEiBGjEDEKqAE+AL+Bp8BOYAj/ARaIdCJF+wYso8B3/rfI7tGO9wCmAHX63gpUUqCoFcn9Af1r1P8LKMshjzHASuAQcBl4CTQBf4GLQT8VAd+BFqAkZPLjaRYZFROAfcDrAPf12o2gCbppQHMaQ5M17lEWSLcDKoC7aUh77ZRcOhCNGjg2ZEw/jXmXIfly4L4lceMVm+QloTisH05rd1JhnsZcj0i8F3BUySBh0b4Cc20nH6pUaX48CHRJ6u8LPFF/VQTyE4EXlsQTwGNghKuROcoyCUX/eu1Alc/4PaCj47wrfPPatDqgJxExRbdwqolvAgMc5uqg7GJLvBXYEuLC1hiklJXwncZ8oL3DHCXK47bkv8lG1mB2b5vPQDXQyeEycvH3Z8BocoRFwA8ZMjm71CKOvjqQPw/0JscYBzyXwQZgWooxJk+vVd62JV+tk24T9NFuGcN/RNZDd92UtsR/AkvJA0wQb/VdRDW6uR86kH+pE80rZgNfHEh77SrQnwLBcMed392W/m4L4/snLPx9iS/QZ+SrPC3RFf8+qWYoUrHzJwX5N8B432JP6rtxv5ltSd6QeCXjb6UqU0nkhqQFTFJfWQr53AKss5HJmWK53MDTQkZmBMG4xm0fyT2qoT+HuFitTifr6AzsjSAlkv+zlc4js0l+MHDLZ+Chbl+X4650lNBfshUXU4GPAUauOcrpiQpk20W0ZBoXs3y7Vi9tbp44dqkOjlLQmDr6kqNL1UaJi1KfityVoqTsp2dG078qogRxEXoPgGEuRg7oxyMhYxZqzDmiodyXjhOWcWEuPivUS6QNtHgXMjk9KoqBzb4aIytxUSTyn9IY955VrpA5+gM7HERh2rho1GrDTuCMJttI9tBVtcFZ34UZ1ELfo46liYHVvuI7V5K4GJgObJBuuqOU3izbF9IV4t7z+iGdRJGKD29xxs0WU8CoCDnG5nyVgVEKlWo9izQp42yXvIgRI0aMGHj4B+il6NiknJKgAAAAAElFTkSuQmCC" 
                   alt="scissors"
                   >
                </span>

                <span class="service-info">
                    <strong>Haircut</strong>
                    <small>Rp50.000</small>
                </span>
            </button>

            <button
                type="button"
                class="service-card"
                data-service="Coloring"
                data-price="50000"
            >
                <span class="service-icon">
                    <img 
                    src="data:image/png;base64,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" 
                    alt="hair-colouring"
                    >
                </span>

                <span class="service-info">
                    <strong>Colouring</strong>
                    <small>Rp50.000</small>
                </span>
            </button>

            <button
                type="button"
                class="service-card"
                data-service="Perming"
                data-price="50000"
            >
                <span class="service-icon">
                    <img 
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACPUlEQVR4nO2WzW9NQRjGf5VuikawEdU0UdKVjSCqf0lZsGhI0BDWbWrbsOEfIHTh9taGTVdsRIIFQpAiYSPpF/1I2LRH3uSZZHLunLnOnHs34kne3Jn387kz73nPgf9IQz9QB1aAn8A0sJ82oVfFVoFloAbMA1lO5kVkWb4PgIFWFF8KFDPZAO5KNgt8LHZfFQL1SDFbO9yL+NmJJWM1UuxvddYnyXeeRRJvaj3V5FSyMj3RW3DnoWJZgl/TnqiXaLBZ4JdktkSj1lLvPNMz/1prO87HkgHp3sgnS+2JxSYEJoDhCIFh+cQILMQI1JrcZVkCoTz3i4pvAe4U3OX3BAIuJi+3VasBFyPdvSeBgIsJyYUQgfcyzull0+8FpMLFu3xz2r8LOf+W8XogQVUCDje0t1oN+OidwAGJn2AEGAN2AuPaO4xIl7e5eMt1EPikvZ12Ay5F7sxw1etk+73ixRbZivKNhgh0AJOaXvmATvkcV3L7zSNv6ywY1bdUqxCHgMvq1BUF7qU8erzJd145LXcpvFSSwwkEjijWciRjKvDcdgHngKd6uy1pfVY2h1HF2iRMxiklsWHj8Mi7068St3/o+T2R7mQVAjuANTXmCel+6BV8GtguOSOd2QxDillTjkq4pn/yVsU+S/Jw+m5NukwzoTK2ed8Az4EPwDPZvkiQzobZC/m+ArbSIvSpkLtrIzQIfJMMeiQznYTFtBS7gZnIdHODxj7rdtFGHNM0s8+vdYmtbwJH21mYfxJ/AE/kZMnSoihHAAAAAElFTkSuQmCC" 
                    alt="external-hair-perming-cosmetic-jumpicon-(glyph)-jumpicon-glyph-ayub-irawan-4"
                    >
                </span>

                <span class="service-info">
                    <strong>Perming</strong>
                    <small>Rp50.000</small>
                </span>
            </button>

            <button
                type="button"
                class="service-card"
                data-service="Smoothing"
                data-price="50000"
            >
                <span class="service-icon">
                    <img 
                    src="data:image/png;base64,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" 
                    alt="hair-straightener"
                    >
                </span>

                <span class="service-info">
                    <strong>Smoothing</strong>
                    <small>Rp50.000</small>
                </span>
            </button>

            <button
                type="button"
                class="service-card"
                data-service="Creambath"
                data-price="50000"
            >
                <span class="service-icon">
                    <img 
                    src="data:image/png;base64,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" 
                    alt="man-combing-hair"
                    >
                </span>

                <span class="service-info">
                    <strong>Creambath</strong>
                    <small>Rp50.000</small>
                </span>
            </button>

        </section>


        <!-- DETAIL TRANSAKSI -->
        <aside class="kasir-order-card">

            <h2>Layanan</h2>

            <!-- NAMA PELANGGAN -->
            <div class="kasir-field">
                <label for="namaPelanggan">
                    Nama Pelanggan
                </label>

                <input
                    type="text"
                    id="namaPelanggan"
                    placeholder="Ketik disini..."
                >
            </div>

            <!-- NAMA BARBER -->
            <div class="kasir-field">
                <label for="namaBarber">
                    Nama Barber
                </label>

                <select id="namaBarber">
                    <option value="">Ketik disini...</option>
                    <option value="Sandi">Sandi</option>
                    <option value="Erik">Erik</option>
                    <option value="Ujang">Ujang</option>
                </select>
            </div>

            <!-- SERVICE TERPILIH -->
            <div class="kasir-selected-service">

                <div class="selected-service-heading">
                    <span>Service</span>
                </div>

                <div
                    id="selectedServices"
                    class="selected-services-list"
                >
                    <p class="empty-service">
                        Belum ada layanan dipilih
                    </p>
                </div>

            </div>

            <!-- TOTAL -->
            <div class="kasir-total">
                <span>Total</span>
                <strong id="kasirTotal">
                    Rp0
                </strong>
            </div>

            <!-- METODE PEMBAYARAN -->
            <div class="kasir-field payment-field">
                <label for="metodePembayaran">
                    Metode Pembayaran
                </label>

                <select id="metodePembayaran">
                    <option value="">Pilih....</option>
                    <option value="cash">Cash</option>
                    <option value="qris">QRIS</option>
                    <option value="transfer">Transfer</option>
                </select>
            </div>

            <!-- BUTTON -->
            <button
                type="button"
                class="kasir-submit"
                id="btnSimpanTransaksi"
            >
                Simpan Transaksi
            </button>

        </aside>

    </div>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>