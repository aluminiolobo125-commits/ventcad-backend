const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log('[db] conectado a PostgreSQL'));
pool.on('error', (err) => console.error('[db] error inesperado', err));

module.exports = { pool };

function query(text, params) {
  return pool.query(text, params);
}

module.exports.query = query;
