document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('riwayatTableBody');
    const notification = document.getElementById('riwayatNotification');

    // Tampilkan notifikasi
    function showNotification() {
        if (!notification) return;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Tangani klik tombol hapus
    if (tableBody) {
        tableBody.addEventListener('click', function (e) {
            const deleteButton = e.target.closest('.riwayat-delete-btn');

            if (!deleteButton) return;

            // Tampilkan konfirmasi sebelum menghapus
            const yakin = window.confirm(
                'Apakah Anda yakin ingin menghapus riwayat transaksi ini?'
            );

            if (!yakin) return;

            const row = deleteButton.closest('tr');

            if (!row) return;

            row.remove();
            showNotification();
        });
    }
});