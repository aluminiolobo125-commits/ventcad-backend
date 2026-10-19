const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { manejarError } = require('../utils/error');

const router = express.Router();

router.post('/registro', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
    const existe = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const contar = await query('SELECT count(*) AS c FROM users');
    const rol = parseInt(contar.rows[0].c, 10) === 0 ? 'admin' : 'vendedor';
    const resultado = await query(
      'INSERT INTO users (email, password_hash, nombre, rol) VALUES ($1,$2,$3,$4) RETURNING id, email, nombre, rol',
      [email, hash, nombre, rol]
    );
    const usuario = resultado.rows[0];
    const token = jwt.sign({ sub: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol } });
  } catch (e) {
    manejarError(res, e);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const resultado = await query('SELECT * FROM users WHERE email = $1', [email]);
    const usuario = resultado.rows[0];
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ sub: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol } });
  } catch (e) {
    manejarError(res, e);
  }
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const partes = header.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') return res.status(401).json({ error: 'No autenticado' });
  try {
    const payload = jwt.verify(partes[1], process.env.JWT_SECRET);
    const resultado = await query('SELECT id, email, nombre, rol, creado_en FROM users WHERE id = $1', [payload.sub]);
    if (resultado.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(resultado.rows[0]);
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
