# Kontrak Backend-Frontend — Kataji Barber

Dokumen ini mencatat nama variabel session dan nama field form yang sudah
disepakati, supaya Backend dan Frontend selalu pakai nama yang sama persis.
Setiap kali ada fitur baru yang butuh session atau form baru, tambahkan ke sini.

## Session (diisi Backend, dibaca Frontend di header.php dkk)

| Nama variabel          | Isi                       | Diisi oleh        | Dibaca di                  |
| ---------------------- | ------------------------- | ----------------- | -------------------------- |
| `$_SESSION['id_user']` | ID user yang login        | login_process.php | auth_check.php             |
| `$_SESSION['nama']`    | Nama lengkap user         | login_process.php | header.php                 |
| `$_SESSION['role']`    | `'owner'` atau `'barber'` | login_process.php | header.php, auth_check.php |

## Form (disiapkan Frontend, dibaca Backend lewat $\_POST)

| Halaman   | Field    | Nama di form (`name="..."`) | Dibaca Backend di |
| --------- | -------- | --------------------------- | ----------------- |
| login.php | Username | `username`                  | login_process.php |
| login.php | Password | `password`                  | login_process.php |

## Redirect / lokasi halaman

| Dari              | Kondisi                             | Tujuan                                   |
| ----------------- | ----------------------------------- | ---------------------------------------- |
| login_process.php | Login gagal                         | `/kataji-barber/pages/login.php?error=1` |
| login_process.php | Login berhasil                      | `/kataji-barber/pages/dashboard.php`     |
| auth_check.php    | Belum login, akses halaman terkunci | `/kataji-barber/pages/login.php`         |

## Endpoint AJAX/JSON (isi kalau ada fitur yang butuh update tanpa reload)

_Belum ada. Tambahkan baris baru di sini kalau Frontend butuh data tanpa reload
halaman (contoh: cari pelanggan otomatis pakai nomor HP)._
