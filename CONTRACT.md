# API Contract — KATAJI Barber

## 1. Kontrak Alur Website Lama

| Dari                | Kondisi                               | Tujuan                                      |
| ------------------- | ------------------------------------- | ------------------------------------------- |
| `login_process.php` | Username/password kosong              | `/KELOMPOK-5/pages/login.php?error=empty`   |
| `login_process.php` | Username/password salah               | `/KELOMPOK-5/pages/login.php?error=invalid` |
| `login_process.php` | Login berhasil                        | `/KELOMPOK-5/pages/dashboard.php`           |
| `auth_check.php`    | Belum login, akses halaman terkunci   | `/KELOMPOK-5/pages/login.php`               |
| `auth_check.php`    | Sesi habis (lebih dari 30 menit idle) | `/KELOMPOK-5/pages/login.php?expired=1`     |

## 2. API Contract — Login

### Login Pengguna

- **Method:** `POST`
- **Endpoint:** `/KELOMPOK-5/api/auth/login.php`
- **Tujuan:** Memverifikasi username dan password pengguna.
- **Content-Type:** `application/json`
- **Format respons:** JSON

Request body:

```json
{
  "username": "erik",
  "password": "password_pengguna"
}
```

Berhasil — `200 OK`:

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

Data di atas hanya contoh format respons.

Penanganan kesalahan:

| Kondisi                       |  HTTP | `error_code`             |
| ----------------------------- | ----: | ------------------------ |
| JSON tidak valid              | `400` | `INVALID_JSON`           |
| Username atau password kosong | `422` | `VALIDATION_ERROR`       |
| Username atau password salah  | `401` | `INVALID_CREDENTIALS`    |
| Content-Type tidak didukung   | `415` | `UNSUPPORTED_MEDIA_TYPE` |
| Method tidak didukung         | `405` | `METHOD_NOT_ALLOWED`     |
| Kesalahan internal            | `500` | `INTERNAL_ERROR`         |

Contoh respons ketika kredensial salah:

```json
{
  "success": false,
  "message": "Username atau password salah.",
  "error_code": "INVALID_CREDENTIALS"
}
```

### Hasil Pengujian Login

| Skenario                     | Status HTTP                  | Hasil           |
| ---------------------------- | ---------------------------- | --------------- |
| Username dan password benar  | `200 OK`                     | Login berhasil  |
| Username atau password salah | `401 Unauthorized`           | Login ditolak   |
| Content-Type tidak sesuai    | `415 Unsupported Media Type` | Request ditolak |
| Method selain POST           | `405 Method Not Allowed`     | Method ditolak  |

Pengujian dilakukan menggunakan Postman pada server lokal.

## 3. API Contract — Layanan

**Base endpoint:** `/api/layanan/`

**Akses:** GET dapat diakses tanpa autentikasi berdasarkan implementasi saat ini. POST, PUT, PATCH, dan DELETE memerlukan sesi login dengan role owner.

### GET — Mengambil Daftar Layanan

- **Endpoint:** `GET /api/layanan/`
- **Body:** Tidak diperlukan.
- **Respons sukses:** `200 OK`
- **Perilaku:** Mengembalikan seluruh layanan, termasuk layanan nonaktif.

Contoh respons:

```json
{
  "success": true,
  "data": [
    {
      "id_layanan": 3,
      "nama_layanan": "Creambath",
      "harga": 100000,
      "hpp": 40000,
      "aktif": 1,
      "icon_layanan": "uploads/layanan/contoh.jpg"
    }
  ]
}
```

Nilai di atas hanya contoh format respons. `icon_layanan` dapat bernilai `null` jika layanan tidak memiliki ikon.

### POST — Menambahkan Layanan

- **Endpoint:** `POST /api/layanan/`
- **Content-Type:** `multipart/form-data`
- **Respons sukses:** `201 Created`

Field form-data:

| Field          | Tipe | Ketentuan                                         |
| -------------- | ---- | ------------------------------------------------- |
| `nama_layanan` | Text | Wajib, maksimal 100 karakter                      |
| `harga`        | Text | Wajib, bilangan bulat lebih dari 0                |
| `hpp`          | Text | Wajib, bilangan bulat 0 atau lebih                |
| `icon_layanan` | File | Opsional; JPG/JPEG, PNG, atau WebP; maksimal 2 MB |

Layanan baru dibuat dengan `aktif = 1`. Ikon disimpan pada folder `uploads/layanan/`, sedangkan database menyimpan path relatifnya.

### PUT — Memperbarui Layanan

- **Endpoint logis:** `PUT /api/layanan/`
- **Metode upload yang digunakan:** `POST /api/layanan/` dengan field `_method=PUT` pada form-data.
- **Content-Type:** `multipart/form-data`
- **Respons sukses:** `200 OK`

Field yang diperlukan: `id_layanan`, `nama_layanan`, `harga`, dan `hpp`. Field `icon_layanan` opsional.

Ketentuan:

- Layanan aktif maupun nonaktif dapat diedit.
- Jika ikon baru tidak dikirim, ikon lama dipertahankan.
- Jika ikon baru berhasil disimpan, ikon lama dihapus setelah pembaruan database berhasil.
- Jika ID tidak ditemukan, respons `404 Not Found`.

### PATCH — Mengubah Status Layanan

- **Endpoint:** `PATCH /api/layanan/`
- **Content-Type:** `application/json`
- **Respons sukses:** `200 OK`

Contoh menonaktifkan layanan:

```json
{
  "id_layanan": 3,
  "aktif": 0
}
```

Untuk mengaktifkan kembali, kirim `"aktif": 1`. Nilai yang didukung hanya `0` dan `1`. PATCH hanya mengubah status dan tidak menghapus ikon.

### DELETE — Menghapus Layanan Permanen

- **Endpoint:** `DELETE /api/layanan/`
- **Content-Type:** `application/json`
- **Respons sukses:** `200 OK`

Contoh body:

```json
{
  "id_layanan": 3
}
```

Layanan dihapus permanen beserta file ikon yang terkait. Gunakan dengan hati-hati karena operasi ini tidak sama dengan menonaktifkan layanan.

### Kode Respons

| HTTP Status                 | Keterangan                            |
| --------------------------- | ------------------------------------- |
| `200 OK`                    | GET, PUT, PATCH, atau DELETE berhasil |
| `201 Created`               | Layanan berhasil dibuat               |
| `400 Bad Request`           | JSON tidak valid                      |
| `401 Unauthorized`          | Sesi login tidak valid                |
| `403 Forbidden`             | Role bukan owner                      |
| `404 Not Found`             | Layanan tidak ditemukan               |
| `405 Method Not Allowed`    | Method tidak didukung                 |
| `422 Unprocessable Content` | Validasi field atau ikon gagal        |
| `500 Internal Server Error` | Kesalahan server                      |

Respons kesalahan umumnya berisi `success: false`, `message`, dan `error_code`.

### Catatan Implementasi

- Tabel `layanan` harus memiliki kolom `icon_layanan VARCHAR(255) NULL`.
- Upload ikon menerima JPG/JPEG, PNG, dan WebP dengan ukuran maksimal 2 MB.
- Folder `uploads/layanan/` harus dapat ditulisi oleh PHP.
- Permintaan perubahan data memerlukan autentikasi owner melalui sesi yang digunakan proyek.
- Untuk form-data PUT, Postman mengirim POST dengan `_method=PUT`; jangan mengatur header `Content-Type` secara manual.
- Hasil pengujian aktual harus dicatat setelah endpoint benar-benar diuji. Dokumentasi ini bukan bukti bahwa semua pengujian telah lulus.

## 4. API Contract — Transaksi

### Base URL Lokal

```text
{{base_url}} = http://localhost:8080/KELOMPOK-5
```

Semua endpoint transaksi memerlukan sesi login yang valid.

### 4.1 GET — Daftar Transaksi

**Endpoint:** `GET /api/transaksi/`

Mengambil daftar transaksi yang dapat diakses oleh pengguna yang sedang login.

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
      "id_pelanggan": 7,
      "nama_pelanggan": "Pelanggan Tes",
      "no_hp": "081234567890",
      "tanggal": "2026-10-13",
      "waktu": "09:00:00",
      "total_harga": 50000,
      "metode_pembayaran": "cash"
    }
  ]
}
```

Contoh nilai di atas bukan data tetap. Transaksi lama yang belum memiliki pelanggan dapat saja memiliki `id_pelanggan`, `nama_pelanggan`, atau `no_hp` bernilai `null`, sesuai data database.

### 4.2 POST — Menambahkan Transaksi

**Endpoint:** `POST /api/transaksi/`

Request body menggunakan JSON dan harus memuat minimal satu layanan.

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

#### Aturan Transaksi

- Owner wajib menentukan `id_barber` yang valid dan aktif.
- Barber yang login otomatis menjadi barber transaksi.
- `id_pencatat` diambil dari pengguna yang sedang login.
- `nama_pelanggan` wajib diisi dan tidak boleh hanya berisi spasi.
- Jika pelanggan baru, data pelanggan dibuat dan dihubungkan dengan transaksi.
- Jika pelanggan dipilih dari saran nama yang sudah ada, transaksi harus menggunakan `id_pelanggan` pelanggan tersebut.
- Memilih pelanggan yang sudah ada tidak boleh membuat baris pelanggan baru untuk orang yang sama hanya karena transaksi baru dicatat.
- Nomor telepon pelanggan dapat dikirim melalui field `no_hp` sesuai validasi endpoint.
- Harga layanan diambil dari database, bukan dipercaya dari harga yang dikirim oleh klien.
- Metode pembayaran wajib dikirim dan harus bernilai `cash`, `qris`, atau `transfer`.
- Total harga dihitung oleh server.
- Data transaksi dan detail layanan disimpan dalam satu transaksi database.

#### Validasi Nama Pelanggan

Jika `nama_pelanggan` kosong atau hanya berisi spasi, server harus menolak transaksi.

- **HTTP:** `422 Unprocessable Content`
- **`error_code`:** `CUSTOMER_NAME_REQUIRED`
- **Pesan:** `Nama pelanggan wajib diisi.`

Contoh respons:

```json
{
  "success": false,
  "message": "Nama pelanggan wajib diisi.",
  "error_code": "CUSTOMER_NAME_REQUIRED"
}
```

Respons di atas merupakan format yang harus digunakan apabila sesuai dengan implementasi endpoint yang sedang diperbarui.

#### Validasi Metode Pembayaran

Metode pembayaran yang diperbolehkan:

- `cash`
- `qris`
- `transfer`

Jika metode pembayaran tidak dikirim atau nilainya kosong, API menolak transaksi dengan HTTP `422 Unprocessable Content` dan kode error `VALIDATION_ERROR`. Form kasir menampilkan pesan `Pilih metode pembayaran` jika metode belum dipilih.

Respons sukses pembuatan transaksi adalah `201 Created`.

### 4.3 Pencatatan dan Saran Pelanggan

Fitur saran nama pelanggan membantu pengguna kasir menemukan pelanggan yang sudah terdaftar.

Alur penggunaan:

1. Pengguna mengetik nama pelanggan pada form transaksi.
2. Antarmuka menampilkan saran pelanggan yang cocok, jika fitur saran tersedia.
3. Jika pengguna memilih saran, form menyimpan `id_pelanggan` yang sesuai.
4. Ketika transaksi dikirim, server menggunakan pelanggan yang dipilih dan tidak membuat data pelanggan duplikat.
5. Jika nama tersebut merupakan pelanggan baru, server menyimpan pelanggan baru dan menghubungkannya ke transaksi.
6. Server menolak transaksi jika nama pelanggan kosong atau hanya berisi spasi.

Contoh body ketika pelanggan yang sudah terdaftar dipilih:

```json
{
  "id_pelanggan": 7,
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

Contoh body ketika pelanggan baru dicatat:

```json
{
  "nama_pelanggan": "Pelanggan Baru",
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

**Catatan endpoint saran:** nama route dan format respons khusus untuk pencarian/saran pelanggan harus dicocokkan dengan file PHP aktual. Jangan menetapkan URL baru dalam dokumentasi sebelum endpoint tersebut dipastikan ada di proyek.

### 4.4 GET — Detail Transaksi

**Endpoint:** `GET /api/transaksi/detail.php?id={id_transaksi}`

Contoh URL Postman:

```text
{{base_url}}/api/transaksi/detail.php?id=1
```

Mengambil informasi transaksi beserta rincian layanan, jumlah, harga saat transaksi, dan subtotal.

Hak akses:

- Owner dapat melihat detail semua transaksi.
- Barber hanya dapat melihat detail transaksi miliknya sendiri.

Respons sukses: `200 OK`.

### 4.5 Kode Respons Transaksi

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

### 4.6 Catatan Implementasi Transaksi

- Format respons menggunakan JSON.
- Harga pada detail transaksi menyimpan snapshot harga ketika transaksi dibuat.
- Database yang sudah ada perlu menjalankan `database/migrations/2026-10-13-add-metode-pembayaran.sql` satu kali, jika migrasi tersebut belum diterapkan.
- Endpoint daftar dan detail transaksi menerapkan pembatasan akses berdasarkan role.
- Semua URL pengujian Postman menggunakan variabel `{{base_url}}` pada environment Postman `Local KELOMPOK-5`.

## 5. API Rekap Pemasukan Harian — WBS 4.5

**Endpoint:** `GET /api/rekap/pemasukan.php`

**Akses:** Owner yang sudah login.

### Query Parameter

| Parameter | Wajib | Keterangan                                                                                                                                      |
| --------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `tanggal` | Tidak | Tanggal rekap dalam format `YYYY-MM-DD`. Jika tidak dikirim, endpoint menggunakan tanggal hari ini berdasarkan zona waktu WIB (`Asia/Jakarta`). |

### Contoh Request

```http
GET {{base_url}}/api/rekap/pemasukan.php
GET {{base_url}}/api/rekap/pemasukan.php?tanggal=2026-10-19
```

### Contoh Respons Sukses

```json
{
  "success": true,
  "data": {
    "tanggal": "2026-10-19",
    "total_pemasukan": 150000,
    "rincian_per_barber": [
      {
        "id_barber": 2,
        "nama_barber": "Nama Barber",
        "jumlah_transaksi": 2,
        "total_pemasukan": 150000
      }
    ]
  }
}
```

Nilai di atas hanya contoh.

### Struktur Data

- `tanggal`: tanggal rekap.
- `total_pemasukan`: total `total_harga` seluruh transaksi pada tanggal tersebut.
- `rincian_per_barber`: daftar pemasukan yang dikelompokkan berdasarkan barber.
- `id_barber`: ID user barber.
- `nama_barber`: nama barber.
- `jumlah_transaksi`: jumlah transaksi barber pada tanggal tersebut.
- `total_pemasukan` di dalam setiap item: total pemasukan barber pada tanggal tersebut.

### Ketentuan

- Rekap menggunakan data transaksi dari tabel `transaksi`.
- Tanggal transaksi mengikuti tanggal yang dicatat dalam zona waktu WIB.
- Tanggal tanpa transaksi tetap mengembalikan respons sukses (`200 OK`), dengan `total_pemasukan` bernilai `0` dan `rincian_per_barber` berupa array kosong.
- Format tanggal tidak valid ditolak dengan `422 Unprocessable Entity`.
- Pengguna yang belum login harus melewati autentikasi terlebih dahulu.
- Pengguna selain owner ditolak dengan `403 Forbidden`.
- Method selain `GET` ditolak dengan `405 Method Not Allowed`.

## 6. API Pengeluaran — WBS 4.3

**Base endpoint:** `/api/pengeluaran/`

**Akses:** Owner yang sudah login.

### 6.1 GET — Daftar Pengeluaran Berdasarkan Tanggal

Endpoint:

`GET /api/pengeluaran/?tanggal=YYYY-MM-DD`

Parameter `tanggal` bersifat opsional. Jika tidak diberikan, endpoint menggunakan tanggal hari ini berdasarkan zona waktu `Asia/Jakarta` (WIB). Filter dan rekap menggunakan kolom `tanggal` bertipe `DATE`.

Respons berhasil (`200 OK`) memuat:

- `tanggal`: tanggal yang diminta.
- `pengeluaran`: daftar pengeluaran pada tanggal tersebut.
- `total_pengeluaran`: total nominal pengeluaran pada tanggal tersebut.

### 6.2 POST — Menambahkan Pengeluaran

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
- `tanggal` opsional; jika tidak diberikan, digunakan tanggal hari ini berdasarkan zona waktu `Asia/Jakarta` (WIB).
- `keterangan` opsional dan maksimal 255 karakter.
- `id_user` diambil dari sesi login, bukan dari body request.

Respons sukses: `201 Created`.

Jika nominal kosong, nol, negatif, bukan bilangan bulat, atau melebihi batas integer, API mengembalikan `422 Unprocessable Content` dengan kode `VALIDATION_ERROR` dan pesan:

`Nominal harus lebih dari nol`

### Status HTTP

| HTTP Status                 | Keterangan                          |
| --------------------------- | ----------------------------------- |
| `400 Bad Request`           | JSON tidak valid (`INVALID_JSON`)   |
| `401 Unauthorized`          | Sesi login tidak valid              |
| `403 Forbidden`             | Pengguna bukan owner                |
| `405 Method Not Allowed`    | Method tidak didukung               |
| `422 Unprocessable Content` | Validasi gagal (`VALIDATION_ERROR`) |
| `500 Internal Server Error` | Kesalahan server                    |

### Skenario Pengujian Pengeluaran

- [x] Simpan pengeluaran kategori Bahan sebesar Rp150.000.
- [x] Pastikan nominal kosong, nol, dan negatif ditolak.
- [x] Ambil daftar pengeluaran berdasarkan tanggal.
- [x] Pastikan pengeluaran Rp150.000 dan Rp50.000 menghasilkan total Rp200.000 pada tanggal yang sama.
- [x] Pastikan pengguna selain owner ditolak.
- [x] Pastikan tanggal default menggunakan tanggal WIB ketika parameter atau field `tanggal` tidak diberikan.
- [x] Pastikan tanggal yang tidak memiliki pengeluaran menghasilkan `pengeluaran` berupa array kosong dan `total_pengeluaran` sebesar `0`.

## 7. Skenario Pengujian Fitur Pelanggan dan Layanan

### Pencatatan Pelanggan

- [ ] Mencatat transaksi untuk pelanggan baru.
- [ ] Memastikan pelanggan baru tersimpan dan terhubung dengan transaksi.
- [ ] Memilih nama pelanggan dari saran yang tersedia.
- [ ] Memastikan pelanggan yang dipilih menggunakan `id_pelanggan` yang benar.
- [ ] Memastikan transaksi baru untuk pelanggan yang dipilih tidak membuat data pelanggan duplikat.
- [ ] Mengirim transaksi dengan `nama_pelanggan` kosong dan memastikan server menolak request.
- [ ] Mengirim transaksi dengan `nama_pelanggan` berisi spasi saja dan memastikan server menolak request.
- [ ] Memastikan pesan validasi nama pelanggan adalah `Nama pelanggan wajib diisi.`

### Pengelolaan Layanan

- [ ] GET layanan mengembalikan daftar layanan beserta status aktif/nonaktif.
- [ ] Layanan nonaktif tetap terlihat pada halaman pengelolaan layanan.
- [ ] Owner dapat mengaktifkan kembali layanan nonaktif.
- [ ] Owner dapat menonaktifkan layanan aktif.
- [ ] Pengguna selain owner tidak dapat melakukan perubahan layanan.

## 8. Catatan Verifikasi Dokumentasi

Dokumen ini dirapikan berdasarkan kontrak API dan ERD yang tersedia serta kebutuhan fitur pelanggan dan layanan.

Sebelum dianggap sebagai dokumentasi final, cocokkan dengan kode aktual di repository, terutama:

- Nama endpoint dan format respons API saran pelanggan.
- Nama kolom serta nilai status aktif/nonaktif layanan.
- Struktur tabel `pelanggan` dan foreign key `transaksi.id_pelanggan`.
- Nama kolom transaksi dan detail transaksi.
- Status HTTP serta `error_code` yang benar-benar dikembalikan oleh endpoint.
- Status pengujian yang telah dilakukan. Jangan tandai pengujian sebagai selesai sebelum benar-benar dijalankan.

## WBS 4.4 — Riwayat Transaksi yang Dicatat Barber

### Deskripsi

Fitur ini memungkinkan barber melihat transaksi yang dicatat sendiri pada tanggal tertentu untuk memeriksa kemungkinan kesalahan input transaksi.

### Endpoint

#### 1. Mengambil daftar riwayat transaksi

- **Method:** `GET`
- **URL:** `/api/transaksi/index.php`
- **Autentikasi:** Wajib login.
- **Role yang diizinkan:** `owner`, `barber`.
- **Query parameter:** `tanggal` (opsional), format `YYYY-MM-DD`.

Contoh request:

```http
GET /api/transaksi/index.php?tanggal=2026-10-23
```

Aturan:

- Jika role adalah `barber` dan parameter `tanggal` tidak diberikan, API menggunakan tanggal hari ini berdasarkan zona waktu `Asia/Jakarta`.
- Jika parameter `tanggal` diberikan, daftar transaksi difilter berdasarkan tanggal tersebut.
- Barber hanya dapat melihat transaksi yang dicatat oleh akun barber yang sedang login (`id_pencatat`).
- Transaksi yang sudah dihapus secara logis (`dihapus_pada` tidak NULL) tidak ditampilkan.
- Daftar diurutkan berdasarkan tanggal, waktu, dan ID transaksi dari terbaru ke terlama.
- Format tanggal yang tidak valid menghasilkan status `400 Bad Request`.
- Pengguna tanpa autentikasi atau role yang diizinkan ditolak sesuai middleware dan aturan otorisasi API.

Contoh respons sukses:

```json
{
  "success": true,
  "data": [
    {
      "id_transaksi": 12,
      "id_pencatat": 3,
      "id_barber": 3,
      "nama_barber": "Sandi",
      "id_pelanggan": 5,
      "nama_pelanggan": "Contoh Pelanggan",
      "tanggal": "2026-10-23",
      "waktu": "11:40:00",
      "total_harga": 50000,
      "metode_pembayaran": "Tunai"
    }
  ]
}
```

Data di atas hanya contoh struktur respons; nilai aktual mengikuti database.

#### 2. Mengambil detail transaksi

- **Method:** `GET`
- **URL:** `/api/transaksi/detail.php?id={id_transaksi}`
- **Autentikasi:** Wajib login.

Aturan:

- Parameter `id` digunakan untuk menentukan transaksi yang diminta.
- Barber hanya boleh mengakses detail transaksi yang dicatat oleh akun yang sedang login (`id_pencatat`).
- Transaksi yang sudah dihapus secara logis seharusnya tidak dapat diakses melalui endpoint detail.
- Hasil pengujian otorisasi harus diverifikasi melalui Postman.

### Perilaku antarmuka

- Riwayat menampilkan tanggal transaksi dan waktu transaksi.
- Barber dapat memilih tanggal untuk melihat transaksi yang dicatat pada tanggal tersebut.
- Transaksi ditampilkan dari waktu terbaru ke terlama.
- Jika tidak ada transaksi pada hari ini, antarmuka menampilkan pesan **“Belum ada transaksi hari ini.”**
- Jika tidak ada transaksi pada tanggal yang dipilih, antarmuka menampilkan pesan **“Belum ada transaksi pada tanggal ini.”**

### Skenario pengujian Postman

| ID         | Skenario                                           | Hasil yang diharapkan                                           | Hasil aktual                            |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| API-RWY-01 | GET riwayat dengan tanggal hari ini sebagai barber | HTTP 200; data hanya milik barber yang login dan sesuai tanggal | Isi setelah tes                         |
| API-RWY-02 | GET riwayat dengan tanggal sebelumnya              | HTTP 200; data sesuai tanggal yang diminta                      | Isi setelah tes                         |
| API-RWY-03 | GET riwayat dengan tanggal tidak valid             | HTTP 400; pesan validasi tanggal                                | Isi setelah tes                         |
| API-RWY-04 | GET riwayat tanpa sesi login                       | Akses ditolak oleh autentikasi API                              | Isi setelah tes                         |
| API-RWY-05 | GET detail transaksi yang dapat diakses            | HTTP 200 dan detail transaksi ditampilkan                       | Isi setelah tes                         |
| API-RWY-06 | GET detail transaksi milik barber lain             | Akses ditolak sesuai aturan otorisasi                           | Isi setelah tes                         |
| UI-RWY-01  | Hari ini memiliki beberapa transaksi               | Semua transaksi hari ini ditampilkan dari terbaru ke terlama    | Sudah diuji di browser; lampirkan bukti |
| UI-RWY-02  | Memilih tanggal sebelumnya                         | Hanya transaksi tanggal yang dipilih ditampilkan                | Sudah diuji di browser; lampirkan bukti |
| UI-RWY-03  | Tidak ada transaksi pada tanggal terpilih          | Pesan kosong ditampilkan                                        | Isi setelah verifikasi                  |

### Bukti pengujian

Lampirkan screenshot Postman yang memperlihatkan method, URL, status HTTP, dan body respons. Jangan tampilkan cookie sesi, token, atau kredensial pada screenshot yang dibagikan.

Catat hasil aktual berdasarkan request yang benar-benar dijalankan. Jangan menandai skenario sebagai berhasil jika belum diuji.
