const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Login obrigatório' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Sessão inválida ou expirada' });
  }
}

module.exports = { requireAuth };
