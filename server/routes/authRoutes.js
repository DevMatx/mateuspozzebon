const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function getAdminConfig() {
  return {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    passwordHash: process.env.ADMIN_PASSWORD_HASH
  };
}

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = getAdminConfig();

  if (!admin.email || (!admin.password && !admin.passwordHash)) {
    return res.status(500).json({ message: 'Defina ADMIN_EMAIL e ADMIN_PASSWORD no arquivo .env' });
  }

  const emailMatches = email === admin.email;
  const passwordMatches = admin.passwordHash
    ? await bcrypt.compare(password || '', admin.passwordHash)
    : password === admin.password;

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Defina JWT_SECRET no arquivo .env' });
  }

  const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.cookie('adminToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });

  return res.json({ email: admin.email });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('adminToken');
  res.json({ message: 'Logout realizado' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ email: req.admin.email });
});

module.exports = router;
