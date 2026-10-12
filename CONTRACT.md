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
