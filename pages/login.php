<?php
// require_once __DIR__ . '/../config/config.php';

// Logika login akan dikerjakan oleh Backend Developer.
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="login-page">

    <!-- Card Login -->
    <div class="login-card">

        <!-- Logo khusus di bagian login -->
        <div class="login-card-logo">
            <img
                src="/KELOMPOK-5/assets/img/logo-kataji.jpeg"
                alt="Logo Kataji Barber"
            >
        </div>

        <h1>Masuk Ke Akun</h1>

        <p class="login-description">
            Silakan masuk untuk mengakses sistem Kataji Barber.
        </p>

        <form method="post" action="login_process.php">

            <!-- Username -->
            <div class="login-field">
                <label for="username">
                    Email / Username
                </label>

                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Masukkan email atau username"
                    required
                >
            </div>

            <!-- Password -->
            <div class="login-field">
                <label for="password">
                    Password
                </label>

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Masukkan password"
                    required
                >
            </div>

            <!-- Lupa Password -->
            <div class="login-forgot">
                <a href="#">
                    Lupa Password?
                </a>
            </div>

            <!-- Tombol Login -->
            <button type="submit" class="login-button">
                Masuk
            </button>

        </form>

        <!-- Daftar Member -->
        <div class="login-register">
            Belum punya akun?
            <a href="#">Daftar Member</a>
        </div>

    </div>

</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>