const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const partes = header.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token no válido' });
  }
  try {
    const payload = jwt.verify(partes[1], process.env.JWT_SECRET);
    req.usuario = { id: payload.sub, email: payload.email, rol: payload.rol };
    next();
  } catch {
    return res.status(401).json({ error: 'Token expirado o inválido' });
  }
}

module.exports = { autenticar };
