const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/despiece', async (req, res) => {
  const { serie_id } = req.query;
  if (!serie_id) return res.status(400).json({ error: 'serie_id requerido' });
  const resultado = await query(
    'SELECT * FROM reglas_despiece WHERE serie_id = $1 ORDER BY rol, pieza',
    [serie_id]
  );
  res.json(resultado.rows);
});

router.post('/despiece', async (req, res) => {
  const { serie_id, rol, pieza, formula, repeticiones, descuento_corte_mm, codigo, corte, herraje_codigo, herraje_unidades, descripcion } = req.body;
  if (!serie_id || !rol || !pieza || !formula || !repeticiones) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const resultado = await query(
    `INSERT INTO reglas_despiece (serie_id, rol, pieza, formula, repeticiones, descuento_corte_mm, codigo, corte, herraje_codigo, herraje_unidades, descripcion)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [serie_id, rol, pieza, formula, repeticiones, descuento_corte_mm, codigo, corte, herraje_codigo, herraje_unidades, descripcion]
  );
  res.status(201).json(resultado.rows[0]);
});

router.get('/herraje', async (req, res) => {
  const { serie_id } = req.query;
  if (!serie_id) return res.status(400).json({ error: 'serie_id requerido' });
  const resultado = await query(
    'SELECT * FROM reglas_herraje WHERE serie_id = $1 ORDER BY herraje_codigo',
    [serie_id]
  );
  res.json(resultado.rows);
});

router.post('/herraje', async (req, res) => {
  const { serie_id, herraje_codigo, cantidad, descripcion } = req.body;
  if (!serie_id || !herraje_codigo || !cantidad) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const resultado = await query(
    `INSERT INTO reglas_herraje (serie_id, herraje_codigo, cantidad, descripcion)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [serie_id, herraje_codigo, cantidad, descripcion]
  );
  res.status(201).json(resultado.rows[0]);
});

module.exports = router;
