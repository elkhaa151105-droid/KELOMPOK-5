| Dari              | Kondisi                               | Tujuan                                      |
| ----------------- | ------------------------------------- | ------------------------------------------- |
| login_process.php | Username/password kosong              | `/KELOMPOK-5/pages/login.php?error=empty`   |
| login_process.php | Username/password salah               | `/KELOMPOK-5/pages/login.php?error=invalid` |
| login_process.php | Login berhasil                        | `/KELOMPOK-5/pages/dashboard.php`           |
| auth_check.php    | Belum login, akses halaman terkunci   | `/KELOMPOK-5/pages/login.php`               |
| auth_check.php    | Sesi habis (lebih dari 30 menit idle) | `/KELOMPOK-5/pages/login.php?expired=1`     |
