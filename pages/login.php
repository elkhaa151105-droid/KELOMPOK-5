<?php
// require_once __DIR__ . '/../config/config.php';
?>

<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="login-page">
    <div class="login-card">
        <div class="login-card-logo">
            <img
                src="/KELOMPOK-5/assets/img/logo-kataji.png"
                alt="Logo Kataji Barber"
            >
        </div>

        <h1>Masuk Ke Akun</h1>

        <p class="login-description">
            Silakan masuk untuk mengakses sistem Kataji Barber.
        </p>

        <?php if (isset($_GET['expired'])): ?>
            <div class="alert alert-warning">
                Sesi Anda sudah habis, silakan login kembali.
            </div>
        <?php endif; ?>

<?php if (isset($_GET['error'])): ?>
    <div class="alert alert-danger">
        Username atau password salah.
    </div>
<?php endif; ?>

<?php if (isset($_GET['username_empty'])): ?>
    <div class="alert alert-danger">
        Username/email wajib diisi.
    </div>
<?php endif; ?>

<?php if (isset($_GET['password_empty'])): ?>
    <div class="alert alert-danger">
        Password wajib diisi.
    </div>
<?php endif; ?>

<?php if (isset($_GET['both_empty'])): ?>
    <div class="alert alert-danger">
        Username/email dan password wajib diisi.
    </div>
<?php endif; ?>

        <form method="post" action="login_process.php">
            <div class="login-field">
                <label for="username">Email / Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Masukkan email atau username"
                    
                >
                
            </div>

            <div class="login-field">
                <label for="password">Password</label>

                <div class="password-wrapper">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Masukkan password"
                        
                    >

                    <button
                        type="button"
                        class="password-toggle"
                        id="passwordToggle"
                    >
                        👁
                    </button>
                </div>

               
            </div>                
                        

            <div class="login-forgot">
                <a href="#">Lupa Password?</a>
            </div>

            <button type="submit" class="login-button">
                Masuk
            </button>
        </form>

        <div class="login-register">
            Akun dibuat oleh Owner. Barber lupa password? Hubungi Owner
            
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>