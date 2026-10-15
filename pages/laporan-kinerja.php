<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_role(['owner']);

// Rute laporan kinerja lama menuju halaman laporan kanonis.
header('Location: /KELOMPOK-5/pages/laporan.php');
exit;
