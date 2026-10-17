## 1. Kontrak Alur Website Lama

| Dari              | Kondisi                               | Tujuan                                      |
| ----------------- | ------------------------------------- | ------------------------------------------- |
| login_process.php | Username/password kosong              | `/KELOMPOK-5/pages/login.php?error=empty`   |
| login_process.php | Username/password salah               | `/KELOMPOK-5/pages/login.php?error=invalid` |
| login_process.php | Login berhasil                        | `/KELOMPOK-5/pages/dashboard.php`           |
| auth_check.php    | Belum login, akses halaman terkunci   | `/KELOMPOK-5/pages/login.php`               |
| auth_check.php    | Sesi habis (lebih dari 30 menit idle) | `/KELOMPOK-5/pages/login.php?expired=1`     |

## 2. API Contract — Login

### Login Pengguna

- **Method:** POST
- **Endpoint:** `/KELOMPOK-5/api/auth/login.php`
- **Tujuan:** Memverifikasi username dan password pengguna.
- **Content-Type:** `application/json`
- **Request Body:** Username dan password.
- **Format Response:** JSON

**Request Body**

```json
{
  "username": "erik",
  "password": "password_pengguna"
}
```

**Berhasil — HTTP 200 OK**

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "id_user": 1,
    "username": "erik",
    "nama": "Nama Pengguna",
    "role": "owner"
  }
}
```

Data pengguna di atas merupakan contoh format respons, bukan data tetap.

**Format JSON tidak valid — HTTP 400 Bad Request**

`error_code`: `INVALID_JSON`

**Username atau password kosong — HTTP 422 Unprocessable Content**

`error_code`: `VALIDATION_ERROR`

**Username atau password salah — HTTP 401 Unauthorized**

```json
{
  "success": false,
  "message": "Username atau password salah.",
  "error_code": "INVALID_CREDENTIALS"
}
```

**Content-Type tidak didukung — HTTP 415 Unsupported Media Type**

`error_code`: `UNSUPPORTED_MEDIA_TYPE`

**Method tidak didukung — HTTP 405 Method Not Allowed**

`error_code`: `METHOD_NOT_ALLOWED`

**Kesalahan internal — HTTP 500 Internal Server Error**

`error_code`: `INTERNAL_ERROR`

### Hasil Pengujian Login

| Skenario                              | Status HTTP                | Hasil           |
| ------------------------------------- | -------------------------- | --------------- |
| Username dan password benar           | 200 OK                     | Login berhasil  |
| Username atau password salah          | 401 Unauthorized           | Login ditolak   |
| Request tanpa format JSON yang sesuai | 415 Unsupported Media Type | Request ditolak |
| Method selain POST                    | 405 Method Not Allowed     | Method ditolak  |

Pengujian dilakukan menggunakan Postman pada server lokal.

## 3. API Contract — Layanan

### Mengambil Daftar Layanan

- **Method:** GET
- **Endpoint:** `/KELOMPOK-5/api/layanan/`
- **Tujuan:** Mengambil daftar layanan aktif.
- **Request Body:** Tidak diperlukan.
- **Format Response:** JSON

**Berhasil — HTTP 200**

```json
{
  "success": true,
  "data": [
    {
      "id_layanan": 3,
      "nama_layanan": "Creambath",
      "harga": 100000
    }
  ]
}
```

Data di atas merupakan contoh format respons, bukan data tetap.

**Method tidak didukung — HTTP 405**

```json
{
  "success": false,
  "message": "Method HTTP tidak diizinkan.",
  "error_code": "METHOD_NOT_ALLOWED"
}
```

**Kesalahan internal — HTTP 500**

```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server.",
  "error_code": "INTERNAL_ERROR"
}
```

### Method yang Didukung

| Method | Fungsi                             |
| ------ | ---------------------------------- |
| GET    | Mengambil daftar layanan aktif     |
| POST   | Menambahkan layanan baru           |
| PUT    | Memperbarui nama dan harga layanan |
| PATCH  | Menonaktifkan layanan              |

POST, PUT, dan PATCH memerlukan sesi login
dengan role owner.

## API Transaksi

Base URL lokal:

`{{base_url}} = http://localhost:8080/KELOMPOK-5`

Semua endpoint transaksi memerlukan sesi login yang valid.

### 1. Daftar Transaksi

**Endpoint:** `GET /api/transaksi/`

Mengambil daftar transaksi yang dapat diakses oleh user yang sedang login.

Hak akses:

- **Owner:** dapat melihat semua transaksi.
- **Barber:** hanya dapat melihat transaksi miliknya sendiri.

Contoh respons sukses (`200 OK`):

```json
{
  "success": true,
  "data": [
    {
      "id_transaksi": 1,
      "id_pencatat": 1,
      "id_barber": 2,
      "nama_barber": "Sandi",
      "id_pelanggan": null,
      "nama_pelanggan": null,
      "no_hp": null,
      "tanggal": "2026-10-13",
      "waktu": "09:00:00",
      "total_harga": 50000,
      "metode_pembayaran": "cash"
    }
  ]
}
```

Nilai di atas hanya contoh format respons.

### 2. Tambah Transaksi

**Endpoint:** `POST /api/transaksi/`

Body menggunakan JSON dengan minimal satu layanan.

Contoh body untuk owner:

```json
{
  "id_barber": 2,
  "nama_pelanggan": "Pelanggan Tes",
  "no_hp": "081234567890",
  "metode_pembayaran": "qris",
  "layanan": [
    {
      "id_layanan": 1,
      "jumlah": 1
    }
  ]
}
```

Contoh body untuk barber:

```json
{
  "nama_pelanggan": "Pelanggan Tes",
  "no_hp": "081234567890",
  "metode_pembayaran": "cash",
  "layanan": [
    {
      "id_layanan": 1,
      "jumlah": 1
    }
  ]
}
```

Aturan:

- Owner wajib menentukan `id_barber` yang valid dan aktif.
- Barber yang login otomatis menjadi barber transaksi.
- `id_pencatat` diambil dari user yang login.
- `id_pelanggan` dibuat jika nama atau nomor telepon pelanggan diberikan.
- Harga layanan diambil dari database.
- Metode pembayaran wajib dikirim dan harus bernilai `cash`, `qris`, atau `transfer`. Jika tidak dikirim atau nilainya kosong, API menolak transaksi dengan HTTP `422 Unprocessable Content` dan kode error `VALIDATION_ERROR`. Form Kasir menampilkan pesan `Pilih metode pembayaran` jika metode belum dipilih.
- Total harga dihitung oleh server.
- Data transaksi dan detail layanan disimpan dalam satu transaksi database.

Respons sukses: `201 Created`.

### 3. Detail Transaksi

**Endpoint:** `GET /api/transaksi/detail.php?id={id_transaksi}`

Contoh URL Postman:

`{{base_url}}/api/transaksi/detail.php?id=1`

Mengambil informasi transaksi beserta rincian layanan, jumlah, harga saat transaksi, dan subtotal.

Hak akses:

- Owner dapat melihat detail semua transaksi.
- Barber hanya dapat melihat detail transaksi miliknya sendiri.

Respons sukses: `200 OK`.

### 4. Kode Respons

| HTTP Status                 | Keterangan                                         |
| --------------------------- | -------------------------------------------------- |
| `200 OK`                    | Data berhasil diambil                              |
| `201 Created`               | Transaksi berhasil dibuat                          |
| `400 Bad Request`           | Format JSON atau input tidak valid                 |
| `401 Unauthorized`          | Belum login atau sesi tidak valid                  |
| `403 Forbidden`             | Role tidak diizinkan                               |
| `404 Not Found`             | Transaksi tidak ditemukan atau tidak dapat diakses |
| `405 Method Not Allowed`    | Method tidak didukung                              |
| `422 Unprocessable Content` | Validasi data gagal                                |
| `500 Internal Server Error` | Kesalahan server                                   |

### 5. Catatan Implementasi

- Format respons menggunakan JSON.
- Harga pada detail transaksi menyimpan snapshot harga ketika transaksi dibuat.
- Database yang sudah ada perlu menjalankan `database/migrations/2026-10-13-add-metode-pembayaran.sql` satu kali.
- Endpoint daftar dan detail transaksi menerapkan pembatasan akses berdasarkan role.
- Semua URL pengujian Postman menggunakan variabel `{{base_url}}` pada environment Postman `Local KELOMPOK-5`.

## API Pengeluaran — WBS 4.3

Base endpoint: `/api/pengeluaran/`

Akses: owner yang sudah login.

### GET — Daftar Pengeluaran Berdasarkan Tanggal

Endpoint:
`GET /api/pengeluaran/?tanggal=YYYY-MM-DD`

Parameter `tanggal` bersifat opsional. Jika tidak diberikan, endpoint menggunakan tanggal hari ini.

Response berhasil (`200 OK`) memuat:

- `tanggal`: tanggal yang diminta.
- `pengeluaran`: daftar pengeluaran pada tanggal tersebut.
- `total_pengeluaran`: total nominal pengeluaran pada tanggal tersebut.

### POST — Menambahkan Pengeluaran

Endpoint:
`POST /api/pengeluaran/`

Header:
`Content-Type: application/json`

Contoh body:

```json
{
  "kategori": "Bahan",
  "nominal": 150000,
  "tanggal": "2026-10-10",
  "keterangan": "Pembelian bahan"
}
```

Aturan validasi:

- `kategori` wajib diisi dan maksimal 100 karakter.
- `nominal` wajib berupa bilangan bulat lebih dari nol.
- `tanggal` opsional; jika tidak diberikan, digunakan tanggal hari ini.
- `keterangan` opsional dan maksimal 255 karakter.
- `id_user` diambil dari sesi login, bukan dari body request.

Response berhasil: `201 Created`.

Jika nominal kosong, nol, negatif, bukan bilangan bulat, atau melebihi batas integer, API mengembalikan `422 Unprocessable Content` dengan kode `VALIDATION_ERROR` dan pesan:

`Nominal harus lebih dari nol`

### Status HTTP

- `400 Bad Request`: JSON tidak valid (`INVALID_JSON`).
- `401 Unauthorized`: sesi login tidak valid.
- `403 Forbidden`: pengguna bukan owner.
- `405 Method Not Allowed`: method tidak didukung.
- `422 Unprocessable Content`: validasi gagal (`VALIDATION_ERROR`).
- `500 Internal Server Error`: kesalahan server.

### Skenario Pengujian

- [ ] Simpan pengeluaran kategori Bahan sebesar Rp150.000.
- [ ] Pastikan nominal kosong, nol, dan negatif ditolak.
- [ ] Ambil daftar pengeluaran berdasarkan tanggal.
- [ ] Pastikan pengeluaran Rp150.000 dan Rp50.000 menghasilkan total Rp200.000 pada tanggal yang sama.
- [ ] Pastikan pengguna selain owner ditolak.
