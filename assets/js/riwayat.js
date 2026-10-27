document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('riwayatTableBody');
    const notification = document.getElementById('riwayatNotification');

    const API_URL = '/KELOMPOK-5/api/transaksi/index.php';
    const DETAIL_URL = '/KELOMPOK-5/api/transaksi/detail.php';
    const HAPUS_URL = '/KELOMPOK-5/api/transaksi/hapus.php';

    if (!tableBody) {
        return;
    }

    // Format nominal menjadi Rupiah.
    function formatRupiah(nominal) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(nominal) || 0);
    }

    // Format tanggal menjadi DD-MM-YYYY.
    function formatTanggal(tanggal) {
        if (!tanggal) return '-';

        const bagian = String(tanggal).slice(0, 10).split('-');

        if (bagian.length !== 3) return tanggal;

        return `${bagian[2]}-${bagian[1]}-${bagian[0]}`;
    }

    // Ubah kode pembayaran menjadi label.
    function formatMetodePembayaran(metode) {
        const metodePembayaran = {
            cash: 'Cash',
            qris: 'QRIS',
            transfer: 'Transfer'
        };

        return metodePembayaran[
            String(metode || '').toLowerCase()
        ] || '-';
    }

    // Tampilkan notifikasi.
    function tampilkanNotifikasi(pesan, berhasil = true) {
        if (!notification) {
            alert(pesan);
            return;
        }

        notification.textContent = pesan;
        notification.hidden = false;

        notification.classList.toggle(
            'transaction-success',
            berhasil
        );

        notification.classList.toggle(
            'transaction-error',
            !berhasil
        );
    }

    // Tampilkan pesan di dalam tabel.
    function tampilkanPesan(pesan) {
        tableBody.replaceChildren();

        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 7;
        cell.textContent = pesan;

        row.appendChild(cell);
        tableBody.appendChild(row);
    }

    // Ambil rincian layanan berdasarkan ID transaksi.
    async function muatDetailTransaksi(idTransaksi) {
        const response = await fetch(
            `${DETAIL_URL}?id=${encodeURIComponent(idTransaksi)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || 'Detail transaksi gagal dimuat.'
            );
        }

        return result.data;
    }

    // Ambil dan tampilkan riwayat transaksi.
    async function muatRiwayat() {
        tampilkanPesan('Memuat riwayat transaksi...');

        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Riwayat transaksi gagal dimuat.'
                );
            }

            if (!Array.isArray(result.data) || result.data.length === 0) {
                tampilkanPesan('Belum ada riwayat transaksi.');
                return;
            }

            tableBody.replaceChildren();

            // Ambil detail layanan setiap transaksi.
            const transaksiDenganDetail = await Promise.all(
                result.data.map(async function (transaksi) {
                    try {
                        const detail = await muatDetailTransaksi(
                            transaksi.id_transaksi
                        );

                        return {
                            ...transaksi,
                            layanan: detail.layanan || []
                        };
                    } catch (error) {
                        console.error(
                            `Detail transaksi ${transaksi.id_transaksi}:`,
                            error
                        );

                        return {
                            ...transaksi,
                            layanan: null
                        };
                    }
                })
            );

            transaksiDenganDetail.forEach(function (transaksi) {
                const row = document.createElement('tr');

                // Kolom Barber.
                const barber = document.createElement('td');
                barber.textContent = transaksi.nama_barber || '-';

                // Kolom Nama pelanggan.
                const nama = document.createElement('td');
                nama.textContent = transaksi.nama_pelanggan || '-';

                // Kolom Tanggal.
                const tanggal = document.createElement('td');
                tanggal.textContent = formatTanggal(transaksi.tanggal);

                // Kolom Layanan.
                const layanan = document.createElement('td');

                if (transaksi.layanan === null) {
                    layanan.textContent = 'Gagal memuat';
                } else if (transaksi.layanan.length === 0) {
                    layanan.textContent = '-';
                } else {
                    layanan.textContent = transaksi.layanan.map(
                        function (item) {
                            const jumlah = Number(item.jumlah) || 1;

                            return jumlah > 1
                                ? `${item.nama_layanan} (${jumlah}x)`
                                : item.nama_layanan;
                        }
                    ).join(', ');
                }

                // Kolom Nominal.
                const nominal = document.createElement('td');
                nominal.textContent = formatRupiah(
                    transaksi.total_harga
                );

                // Kolom Metode Pembayaran.
                const pembayaran = document.createElement('td');
                pembayaran.textContent = formatMetodePembayaran(
                    transaksi.metode_pembayaran
                );

                // Kolom Aksi.
                const aksi = document.createElement('td');

                const tombolHapus = document.createElement('button');
                tombolHapus.type = 'button';
                tombolHapus.className = 'riwayat-delete-btn';
                tombolHapus.textContent = '×';
                tombolHapus.setAttribute(
                    'aria-label',
                    'Hapus riwayat transaksi'
                );
                tombolHapus.dataset.idTransaksi =
                    transaksi.id_transaksi;

                aksi.appendChild(tombolHapus);

                row.append(
                    barber,
                    nama,
                    tanggal,
                    layanan,
                    nominal,
                    pembayaran,
                    aksi
                );

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Gagal memuat riwayat:', error);

            tampilkanPesan(
                error.message || 'Riwayat transaksi gagal dimuat.'
            );
        }
    }

    // Hapus riwayat transaksi melalui API.
    tableBody.addEventListener('click', async function (event) {
        const tombol = event.target.closest('.riwayat-delete-btn');

        if (!tombol) return;

        const idTransaksi = tombol.dataset.idTransaksi;

        if (!idTransaksi) {
            tampilkanNotifikasi(
                'ID transaksi tidak ditemukan.',
                false
            );
            return;
        }

        if (!confirm('Yakin ingin menghapus riwayat transaksi ini?')) {
            return;
        }

        tombol.disabled = true;

        try {
            const response = await fetch(HAPUS_URL, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: new URLSearchParams({
                    id_transaksi: idTransaksi
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Gagal menghapus transaksi.'
                );
            }

            tampilkanNotifikasi(
                result.message || 'Riwayat transaksi berhasil dihapus.',
                true
            );

            await muatRiwayat();
        } catch (error) {
            console.error('Gagal menghapus transaksi:', error);

            tampilkanNotifikasi(
                error.message || 'Gagal menghapus riwayat transaksi.',
                false
            );

            tombol.disabled = false;
        }
    });

    muatRiwayat();
});
