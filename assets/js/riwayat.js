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


    // Hapus satu baris riwayat
    if (tableBody) {

        tableBody.addEventListener('click', function (e) {

            const deleteButton = e.target.closest('.riwayat-delete-btn');

            if (!deleteButton) return;

            const row = deleteButton.closest('tr');

            if (!row) return;

            // Hapus hanya baris yang dipilih
            row.remove();

            // Tampilkan notifikasi
            showNotification();

        });

    }

});