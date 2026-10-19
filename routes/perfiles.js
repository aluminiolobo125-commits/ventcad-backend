const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const { serie_id } = req.query;
  let texto = 'SELECT p.*, s.nombre AS serie_nombre FROM perfiles p LEFT JOIN series s ON s.id = p.serie_id';
  const params = [];
  const condiciones = [];
  if (serie_id) {
    condiciones.push('p.serie_id = $1');
    params.push(serie_id);
  }
  if (condiciones.length) texto += ' WHERE ' + condiciones.join(' AND ');
  texto += ' ORDER BY p.codigo';
  const resultado = await query(texto, params);
  res.json(resultado.rows);
});

router.post('/', async (req, res) => {
  const { serie_id, codigo, nombre, rol, precio_metro_mxn, precios_por_acabado_usd, medida_barra_m, peso_kg_m } = req.body;
  if (!serie_id || !codigo || !nombre) return res.status(400).json({ error: 'serie_id, codigo y nombre requeridos' });
  const resultado = await query(
    `INSERT INTO perfiles (serie_id, codigo, nombre, rol, precio_metro_mxn, precios_por_acabado_usd, medida_barra_m, peso_kg_m)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [serie_id, codigo, nombre, rol, precio_metro_mxn, precios_por_acabado_usd, medida_barra_m, peso_kg_m]
  );
  res.status(201).json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, rol, precio_metro_mxn, precios_por_acabado_usd, medida_barra_m, peso_kg_m } = req.body;
  const resultado = await query(
    `UPDATE perfiles SET nombre=$1, rol=$2, precio_metro_mxn=$3, precios_por_acabado_usd=$4, medida_barra_m=$5, peso_kg_m=$6
     WHERE id=$7 RETURNING *`,
    [nombre, rol, precio_metro_mxn, precios_por_acabado_usd, medida_barra_m, peso_kg_m, id]
  );
  if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM perfiles WHERE id=$1', [id]);
  res.json({ ok: true });
});

module.exports = router;
