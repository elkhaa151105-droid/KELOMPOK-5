# ERD — Transaksi Multi-Layanan dan Pengeluaran

```mermaid
erDiagram
    TRANSAKSI ||--|{ DETAIL_TRANSAKSI : memiliki
    LAYANAN ||--o{ DETAIL_TRANSAKSI : tercatat_dalam
    USERS ||--o{ PENGELUARAN : mencatat

    TRANSAKSI {
        int id_transaksi PK
        int total_harga
        enum metode_pembayaran
    }

    DETAIL_TRANSAKSI {
        int id_detail PK
        int id_transaksi FK
        int id_layanan FK
        int harga_saat_transaksi
        int hpp_saat_transaksi
        int jumlah
    }

    LAYANAN {
        int id_layanan PK
        int harga
    }

    USERS {
        int id_user PK
        string nama
        enum role
    }

    PENGELUARAN {
        int id_pengeluaran PK
        int id_user FK
        date tanggal
        string kategori
        int nominal
        string keterangan
        timestamp dibuat_pada
    }
```

## Catatan Pengeluaran

- `id_pengeluaran` adalah primary key dan bertambah otomatis.
- `id_user` adalah foreign key ke `users.id_user`, yaitu owner yang mencatat pengeluaran melalui API.
- `tanggal` digunakan untuk menyaring daftar dan menghitung total pengeluaran harian.
- `nominal` wajib lebih dari nol.
- `keterangan` bersifat opsional.
