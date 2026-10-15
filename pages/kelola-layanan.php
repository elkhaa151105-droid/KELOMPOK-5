<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_role(['owner']);

// Gunakan satu halaman CRUD layanan sebagai rute kanonis.
header('Location: /KELOMPOK-5/pages/layanan.php');
exit;
