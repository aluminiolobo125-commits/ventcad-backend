require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db');
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const obrasRoutes = require('./routes/obras');
const presupuestosRoutes = require('./routes/presupuestos');
const catalogoRoutes = require('./routes/catalogo');
const seriesRoutes = require('./routes/series');
const perfilesRoutes = require('./routes/perfiles');
const herrajesRoutes = require('./routes/herrajes');
const reglasRoutes = require('./routes/reglas');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Sirve las imágenes de sección de perfil desde public/perfiles
app.use('/api/perfiles-imagenes', express.static(path.join(__dirname, '../public/perfiles')));

// Health check: verifica que la DB responda
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'conectado' });
  } catch {
    res.status(503).json({ ok: false, db: 'desconectado' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/obras', obrasRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/herrajes', herrajesRoutes);
app.use('/api/reglas', reglasRoutes);

// Middleware de errores centralizado
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`[ventcad-backend] escuchando en http://localhost:${PORT}`);
});
