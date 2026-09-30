<?php
require_once __DIR__ . '/../config/config.php';
// TODO (Backend Developer): proses validasi username & password sesuai acceptance
// criteria story "Login barber" dan "Login owner" akan ditulis di sini atau di
// login_process.php terpisah. Kerangka ini baru menyediakan formnya.
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<div class="row justify-content-center">
  <div class="col-md-4">
    <h1 class="h4 mb-3 text-center">Masuk ke Kataji Barber</h1>
    <form method="post" action="login_process.php">
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input type="text" name="username" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-dark w-100">Masuk</button>
    </form>
  </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
