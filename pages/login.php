
<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (empty($_SESSION['login_csrf_token'])) {
    $_SESSION['login_csrf_token'] = bin2hex(random_bytes(32));
}

$error = $_GET['error'] ?? '';
$expired = isset($_GET['expired']);

$error_username = false;
$error_password = false;
$error_message = '';

if (
    $error === 'empty'
    || isset($_GET['both_empty'])
    || isset($_GET['username_empty'])
    || isset($_GET['password_empty'])
) {
    $error_username = (
        $error === 'empty'
        || isset($_GET['both_empty'])
        || isset($_GET['username_empty'])
    );

    $error_password = (
        $error === 'empty'
        || isset($_GET['both_empty'])
        || isset($_GET['password_empty'])
    );

    if ($error_username && $error_password) {
        $error_message = 'Username dan password wajib diisi';
    } elseif ($error_username) {
        $error_message = 'Username wajib diisi';
    } else {
        $error_message = 'Password wajib diisi';
    }
} elseif ($error === 'invalid' || $error === '1') {
    $error_username = true;
    $error_password = true;
    $error_message = 'Username atau password salah';
} elseif ($error === 'csrf') {
    $error_message = 'Form login kedaluwarsa. Silakan coba lagi.';
} elseif ($expired) {
    $error_username = true;
    $error_password = true;
    $error_message = 'Sesi Anda sudah habis, silakan login kembali.';
}

$saved_username = $_POST['username'] ?? $_GET['username'] ?? '';

?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Login - Kataji Barber</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
    >

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <link
        rel="stylesheet"
        href="/KELOMPOK-5/assets/css/style.css"
    >
</head>

<body>

<div class="login-page">

    <!-- CARD LOGIN -->
    <div class="login-card">

        <div class="login-card-logo">
            <img
                src="/KELOMPOK-5/assets/img/logo-kataji.png"
                alt="Logo Kataji Barber"
            >
        </div>

        <h1>Masuk Ke Akun</h1>

        <p class="login-description">
            Masukkan email/username dan password akunmu.
        </p>

        <form
            id="loginForm"
            method="post"
            action="/KELOMPOK-5/pages/login_process.php"
            class="login-form"
            novalidate
        >

            <input
                type="hidden"
                name="csrf_token"
                value="<?= htmlspecialchars($_SESSION['login_csrf_token'], ENT_QUOTES, 'UTF-8') ?>"
            >

            <!-- USERNAME -->
            <div class="login-field">

                <label for="username">
                    Email / Username
                </label>

                <div
                    id="usernameWrapper"
                    class="input-with-icon <?= $error_username ? 'has-error' : '' ?>"
                >

                    <span class="field-icon">
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect
                                x="2"
                                y="4"
                                width="20"
                                height="16"
                                rx="2"
                            ></rect>

                            <path
                                d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                            ></path>
                        </svg>
                    </span>

                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="nama@email.com / username"
                        value="<?= htmlspecialchars($saved_username, ENT_QUOTES, 'UTF-8') ?>"
                        autocomplete="username"
                    >

                </div>

            </div>

            <!-- PASSWORD -->
            <div class="login-field">

                <label for="password">
                    Password
                </label>

                <div
                    id="passwordWrapper"
                    class="input-with-icon <?= $error_password ? 'has-error' : '' ?>"
                >

                    <span class="field-icon">
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                            ></rect>

                            <path
                                d="M7 11V7a5 5 0 0 1 10 0v4"
                            ></path>
                        </svg>
                    </span>

                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                    >

                    <button
                        type="button"
                        class="password-toggle"
                        id="passwordToggle"
                        aria-label="Tampilkan Password"
                    >
                        <svg
                            id="eyeIcon"
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            ></path>

                            <circle
                                cx="12"
                                cy="12"
                                r="3"
                            ></circle>
                        </svg>
                    </button>

                </div>

                <!-- PESAN ERROR -->
                <div
                    id="loginErrorMessage"
                    class="login-inline-error"
                    style="<?= $error_message !== '' ? 'display: block;' : 'display: none;' ?>"
                    role="alert"
                >
                    <?= htmlspecialchars(
                        $error_message !== '' ? '*' . $error_message : '',
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>
                </div>

            </div>

            <!-- LUPA PASSWORD -->
            <div class="login-forgot">
                <a href="#">
                    Lupa Password?
                </a>
            </div>

            <!-- TOMBOL LOGIN -->
            <button
                type="submit"
                id="btnLogin"
                class="login-button"
            >
                Masuk
            </button>

        </form>

        <!-- INFORMASI -->
        <div class="login-register">
            Akun dibuat oleh owner, Barber lupa password? Hubungi Owner
        </div>

    </div>

</div>

<script src="/KELOMPOK-5/assets/js/script.js"></script>

</body>
</html>
