require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
const modelosRoutes = require('./routes/modelos');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Sirve las imágenes de sección de perfil desde backend/public/perfiles
app.use('/api/perfiles-imagenes', express.static(path.join(__dirname, 'public/perfiles')));

/**
 * Ejecuta un archivo SQL dividiendo por ';' y ejecutando cada statement.
 * Ignora statements vacíos y comentarios de línea.
 */
async function ejecutarSqlArchivo(rutaArchivo) {
  const sql = fs.readFileSync(rutaArchivo, 'utf8');
  // Quita comentarios de línea ANTES de dividir, para no perder el primer statement.
  const sinComentarios = sql
    .split('\n')
    .filter((linea) => !linea.trim().startsWith('--'))
    .join('\n');
  const statements = sinComentarios
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (e) {
      // Ignorar errores de "ya existe" para ser idempotente
      if (e.message && (e.message.includes('already exists') || e.message.includes('duplicate key'))) {
        continue;
      }
      console.warn('[init] omitiendo statement:', e.message);
    }
  }
}

/** Inicializa la base de datos automáticamente al arrancar. */
async function initDb() {
  try {
    console.log('[init] verificando base de datos...');
    await ejecutarSqlArchivo(path.join(__dirname, 'sql/schema.sql'));
    console.log('[init] schema aplicado');
    await ejecutarSqlArchivo(path.join(__dirname, 'sql/seed.sql'));
    console.log('[init] seed aplicado');
  } catch (e) {
    console.error('[init] error inicializando base de datos:', e.message);
  }
}

// Rutas de API
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
app.use('/api/modelos', modelosRoutes);

// Middleware de errores centralizado
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializa DB y arranca el servidor
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[ventcad-backend] escuchando en http://localhost:${PORT}`);
  });
});
