const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const { serie_id } = req.query;
  let texto = 'SELECT * FROM herrajes';
  const params = [];
  if (serie_id) {
    texto += ' WHERE serie_id = $1 OR serie_id IS NULL';
    params.push(serie_id);
  }
  texto += ' ORDER BY nombre';
  const resultado = await query(texto, params);
  res.json(resultado.rows);
});

router.post('/', async (req, res) => {
  const { serie_id, codigo, nombre, tipo, precio_unidad, precio_lista_usd, acabado, unidad, aplica_a } = req.body;
  if (!nombre || !tipo) return res.status(400).json({ error: 'Nombre y tipo requeridos' });
  const resultado = await query(
    `INSERT INTO herrajes (serie_id, codigo, nombre, tipo, precio_unidad, precio_lista_usd, acabado, unidad, aplica_a)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [serie_id, codigo, nombre, tipo, precio_unidad, precio_lista_usd, acabado, unidad, aplica_a]
  );
  res.status(201).json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, precio_unidad, precio_lista_usd, acabado, unidad, aplica_a } = req.body;
  const resultado = await query(
    `UPDATE herrajes SET nombre=$1, tipo=$2, precio_unidad=$3, precio_lista_usd=$4, acabado=$5, unidad=$6, aplica_a=$7
     WHERE id=$8 RETURNING *`,
    [nombre, tipo, precio_unidad, precio_lista_usd, acabado, unidad, aplica_a, id]
  );
  if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM herrajes WHERE id=$1', [id]);
  res.json({ ok: true });
});

module.exports = router;
