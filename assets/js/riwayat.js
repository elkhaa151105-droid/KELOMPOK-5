document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('riwayatTableBody');
    const notification = document.getElementById('riwayatNotification');

    const API_URL = '/KELOMPOK-5/api/transaksi/index.php';
    const DETAIL_URL = '/KELOMPOK-5/api/transaksi/detail.php';

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

        const bagian = tanggal.split('-');

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

        return metodePembayaran[metode] || '-';
    }

    // Tampilkan pesan di dalam tabel.
    function esan(pesan) {
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

    // Ambil dan tampilkan seluruh riwayat.
    async function muatRiwayat() {
        try {
            const response = await fetch(API_URL, {
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

            tableBody.replaceChildren();

            if (!Array.isArray(result.data) || result.data.length === 0) {
                tampilkanPesan('Belum ada riwayat transaksi.');
                return;
            }

            // Ambil detail setiap transaksi.
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

                const nama = document.createElement('td');
                nama.textContent = transaksi.nama_pelanggan || '-';

                const tanggal = document.createElement('td');
                tanggal.textContent = formatTanggal(transaksi.tanggal);

                const layanan = document.createElement('td');

                if (transaksi.layanan === null) {
                    layanan.textContent = 'Gagal memuat';
                } else if (transaksi.layanan.length === 0) {
                    layanan.textContent = '-';
                } else {
                    layanan.textContent = transaksi.layanan.map(function (item) {
                        const jumlah = Number(item.jumlah) || 1;
                        return jumlah > 1
                            ? `${item.nama_layanan} (${jumlah}x)`
                            : item.nama_layanan;
                    }).join(', ');
                }

                const nominal = document.createElement('td');
                nominal.textContent = formatRupiah(transaksi.total_harga);

                const pembayaran = document.createElement('td');
                pembayaran.textContent = formatMetodePembayaran(
                    transaksi.metode_pembayaran
                );

                const barber = document.createElement('td');
                barber.textContent = transaksi.nama_barber || '-';

                const aksi = document.createElement('td');

                const tombolHapus = document.createElement('button');
                tombolHapus.type = 'button';
                tombolHapus.className = 'riwayat-delete-btn';
                tombolHapus.textContent = '×';
                tombolHapus.setAttribute(
                    'aria-label',
                    'Hapus riwayat transaksi'
                );
                tombolHapus.dataset.idTransaksi = transaksi.id_transaksi;

                aksi.appendChild(tombolHapus);

                row.append(
                    nama,
                    tanggal,
                    layanan,
                    nominal,
                    barber,
                    pembayaran,
                    barber,
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

    // Tombol hapus menunggu endpoint DELETE transaksi.
    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            const tombol = event.target.closest('.riwayat-delete-btn');

            if (!tombol) return;

            alert(
                'Fitur hapus belum dihubungkan ke API penghapusan transaksi.'
            );
        });

        muatRiwayat();
    }
});