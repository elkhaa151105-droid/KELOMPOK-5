# Pedoman Pengembangan KELOMPOK-5

## 1. Prinsip utama FE dan BE

- FE yang telah ditentukan menjadi acuan utama desain, field, komponen, alur interaksi, dan kebutuhan fitur.
- BE lokal tidak boleh dipertahankan begitu saja jika belum mendukung kebutuhan FE.
- Audit dan sesuaikan FE, BE, API, handler, validasi, serta database agar aplikasi bekerja secara terintegrasi.
- Jangan menghilangkan fitur FE hanya karena implementasi BE saat ini belum mendukungnya. Evaluasi dan rencanakan pengembangan BE yang diperlukan terlebih dahulu.
- Jangan menganggap semua kode FE atau BE pasti benar. Identifikasi sumber masalah berdasarkan kebutuhan proyek dan hasil pemeriksaan.

## 2. Referensi FE

- Gunakan referensi FE proyek yang telah ditentukan: branch `origin/frontend`, commit `653ddc8ac0d3fb9884c0f13c5b416e957d161a33`, selama referensi tersebut tersedia.
- Periksa implementasi FE yang sebenarnya, termasuk markup, CSS, komponen, field, tombol, dan interaksi.
- Jangan mengganti desain dengan perkiraan sendiri jika implementasi atau screenshot referensi tersedia.
- Jika commit acuan tidak tersedia, jangan mengarang hasil perbandingan. Laporkan keterbatasannya.

## 3. Penyesuaian backend dan database

- Cocokkan kontrak FE dengan endpoint, request/response, handler, query, validasi, autentikasi, dan otorisasi BE.
- Jika FE membutuhkan field atau fitur yang belum tersedia, analisis perubahan BE dan database yang diperlukan.
- Sebelum migrasi atau perubahan database yang berisiko, jelaskan rencana, dampak terhadap data, kompatibilitas, dan strategi migrasi.
- Jangan memasukkan nilai palsu atau menggunakan data contoh FE sebagai data aplikasi.
- Pertahankan keamanan dan hak akses setiap role.

## 4. Cara mengerjakan

- Audit kebutuhan dan kondisi kode sebelum mengedit.
- Identifikasi file FE dan BE yang terlibat serta perbedaan yang ditemukan.
- Buat perubahan minimal yang menyelesaikan masalah, tetapi jangan membatasi perubahan hanya pada FE jika akar masalahnya ada di BE atau database.
- Kerjakan secara bertahap dan jelaskan alasan perubahan.
- Pertahankan perubahan lokal, staged changes, dan pekerjaan yang tidak terkait.
- Jangan menjalankan Git reset, menghapus perubahan pengguna, atau melakukan operasi database yang berisiko tanpa persetujuan.
- Hindari duplikasi CSS, handler, endpoint, dan logika bisnis.

## 5. Verifikasi wajib

- Jalankan pemeriksaan sintaks dan pemeriksaan diff jika tersedia.
- Uji fungsi FE–BE–database jika lingkungan memungkinkan.
- Bandingkan hasil visual dengan FE pada ukuran viewport yang sama jika browser tersedia.
- Bedakan hasil yang sudah diuji, pemeriksaan statis, dan hal yang belum diuji.
- Jangan mengklaim fitur berhasil atau tampilan sudah cocok tanpa bukti yang sesuai.

## 6. Pelaporan

Setiap tugas harus melaporkan:

1. Kebutuhan FE yang menjadi acuan.
2. Perbedaan yang ditemukan pada FE, BE, dan database.
3. File yang diubah dan alasan perubahan.
4. Hasil pengujian beserta bukti atau keterbatasannya.
5. Kekurangan yang masih tersisa dan langkah lanjutan yang diperlukan.
