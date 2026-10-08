<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_role(['owner']);
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="layanan-page">

    <div class="layanan-heading">
        <h1>Layanan</h1>
        
    </div>

    <!-- DAFTAR LAYANAN -->
    <div class="layanan-card">

        <div class="layanan-table-wrapper">
            <table class="layanan-table">
                <thead>
                    <tr>
                        <th>Layanan</th>
                        <th>Harga</th>
                        <th>HPP</th>
                        <th>Aktif</th>
                        
                    </tr>
                </thead>

     <tbody id="layananTableBody">

    <tr>
        <td>Haircut</td>

        <td>
            <input
                type="number"
                class="layanan-price-input"
                value="50000"
            >
        </td>

        <td>
            <input
                type="number"
                class="layanan-hpp-input"
                value="5000"
            >
        </td>

        <td>
            <input
                type="checkbox"
                class="layanan-checkbox"
                checked
            >
        </td>
    </tr>

    <tr>
        <td>Colouring</td>

        <td>
            <input
                type="number"
                class="layanan-price-input"
                value="150000"
            >
        </td>

        <td>
            <input
                type="number"
                class="layanan-hpp-input"
                value="50000"
            >
        </td>

        <td>
            <input
                type="checkbox"
                class="layanan-checkbox"
                checked
            >
        </td>
    </tr>

    <tr>
        <td>Perming</td>

        <td>
            <input
                type="number"
                class="layanan-price-input"
                value="100000"
            >
        </td>

        <td>
            <input
                type="number"
                class="layanan-hpp-input"
                value="25000"
            >
        </td>

        <td>
            <input
                type="checkbox"
                class="layanan-checkbox"
                checked
            >
        </td>
    </tr>

    <tr>
        <td>Smoothing</td>

        <td>
            <input
                type="number"
                class="layanan-price-input"
                value="100000"
            >
        </td>

        <td>
            <input
                type="number"
                class="layanan-hpp-input"
                value="10000"
            >
        </td>

        <td>
            <input
                type="checkbox"
                class="layanan-checkbox"
                checked
            >
        </td>
    </tr>

    <tr>
        <td>Creambath</td>

        <td>
            <input
                type="number"
                class="layanan-price-input"
                value="30000"
            >
        </td>

        <td>
            <input
                type="number"
                class="layanan-hpp-input"
                value="15000"
            >
        </td>

        <td>
            <input
                type="checkbox"
                class="layanan-checkbox"
            >
        </td>
    </tr>

</tbody>
            </table>
        </div>

    </div>


    <!-- TAMBAH LAYANAN -->
    <div class="layanan-card tambah-layanan-card">

    <h2>Tambah Layanan</h2>

    <form id="formTambahLayanan" class="tambah-layanan-form">

        <div class="layanan-input-group">
            <label for="namaLayanan">Nama</label>
            <input
                type="text"
                id="namaLayanan"
            >
            <span id="errorNamaLayanan" class="layanan-error"></span>
        </div>

        <div class="layanan-input-group">
            <label for="hargaLayanan">Harga</label>
            <input
                type="number"
                id="hargaLayanan"
                min="1"
            >
            <span id="errorHargaLayanan" class="layanan-error"></span>
        </div>

        <div class="layanan-input-group">
            <label for="hppLayanan">HPP</label>
            <input
                type="number"
                id="hppLayanan"
                min="0"
            >
            <span id="errorHppLayanan" class="layanan-error"></span>
        </div>

        <button type="submit" class="layanan-submit">
            Tambah
        </button>

    </form>

</div>

</div>

<script src="/KELOMPOK-5/assets/js/layanan.js"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>