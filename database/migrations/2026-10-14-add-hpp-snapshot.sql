-- Tambahkan dukungan HPP tanpa mengisi nilai buatan untuk data lama.
-- Layanan dan detail transaksi lama akan memiliki HPP NULL sampai nilainya
-- diverifikasi dan diisi oleh owner.
ALTER TABLE layanan
    ADD COLUMN hpp INT NULL CHECK (hpp IS NULL OR hpp >= 0) AFTER harga;

ALTER TABLE detail_transaksi
    ADD COLUMN hpp_saat_transaksi INT NULL
        CHECK (hpp_saat_transaksi IS NULL OR hpp_saat_transaksi >= 0)
        AFTER harga_saat_transaksi;
