const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.getElementById('password');
if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            passwordToggle.textContent = '👁';
        }
    });
}