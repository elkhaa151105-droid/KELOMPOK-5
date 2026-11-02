-- Jalankan satu kali pada database kataji_barber yang sudah ada.
ALTER TABLE transaksi
    ADD COLUMN metode_pembayaran ENUM('cash', 'qris', 'transfer')
    NOT NULL DEFAULT 'cash' AFTER total_harga;
