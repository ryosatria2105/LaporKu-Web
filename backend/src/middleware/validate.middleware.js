// ================================================================
// VALIDATE MIDDLEWARE
// ----------------------------------------------------------------
// Sanitasi + validasi input sebelum masuk ke controller.
// Defense-in-depth di atas Prisma (Prisma sudah parameterized,
// ini lapisan tambahan untuk reject input berbahaya lebih awal).
// ================================================================

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

function createError(res, message) {
  return res.status(400).json({ success: false, message });
}

export function validateRegister(req, res, next) {
  let { nama, username, email, phone, password } = req.body;

  if (!nama || !username || !email || !password)
    return createError(res, 'Semua field wajib diisi');

  nama     = sanitize(nama);
  username = sanitize(username);
  email    = sanitize(email);
  phone    = phone ? sanitize(phone) : phone;

  if (nama.length < 2 || nama.length > 100)
    return createError(res, 'Nama harus antara 2-100 karakter');

if (!/^[a-zA-Z0-9_@.\-]+$/.test(username))
  return createError(res, 'Username tidak valid');

  if (username.length < 3 || username.length > 50)
    return createError(res, 'Username harus antara 3-50 karakter');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return createError(res, 'Format email tidak valid');

  if (password.length < 8)
    return createError(res, 'Password minimal 8 karakter');

  req.body = { nama, username, email, phone, password };
  next();
}

export function validateLogin(req, res, next) {
  let { login, password } = req.body;

  if (!login || !password)
    return createError(res, 'Login dan password wajib diisi');

  login = sanitize(login);

  if (login.length < 3)
    return createError(res, 'Input login tidak valid');

  if (password.length < 8)
    return createError(res, 'Password minimal 8 karakter');

  req.body = { login, password };
  next();
}

export function validateForgotPassword(req, res, next) {
  let { email } = req.body;

  if (!email)
    return createError(res, 'Email wajib diisi');

  email = sanitize(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return createError(res, 'Format email tidak valid');

  req.body = { email };
  next();
}

export function validateResetPassword(req, res, next) {
  const { token, new_password, confirm_password } = req.body;

  if (!token || !new_password || !confirm_password)
    return createError(res, 'Semua field wajib diisi');

  if (new_password.length < 8)
    return createError(res, 'Password minimal 8 karakter');

  if (new_password !== confirm_password)
    return createError(res, 'Password tidak sama');

  next();
}