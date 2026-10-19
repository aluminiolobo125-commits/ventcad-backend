const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const resultado = await query(
    'SELECT * FROM series WHERE user_id IS NULL OR user_id = $1 ORDER BY nombre',
    [req.usuario.id]
  );
  res.json(resultado.rows);
});

router.post('/', async (req, res) => {
  const { nombre, tipo, descripcion, colores, ancho_vista_marco_mm, ancho_vista_hoja_mm, config_anovalum } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  const resultado = await query(
    `INSERT INTO series (user_id, nombre, tipo, descripcion, colores, ancho_vista_marco_mm, ancho_vista_hoja_mm, config_anovalum)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.usuario.id, nombre, tipo, descripcion, colores, ancho_vista_marco_mm, ancho_vista_hoja_mm, config_anovalum]
  );
  res.status(201).json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, descripcion, colores, ancho_vista_marco_mm, ancho_vista_hoja_mm, config_anovalum } = req.body;
  const resultado = await query(
    `UPDATE series SET nombre=$1, tipo=$2, descripcion=$3, colores=$4, ancho_vista_marco_mm=$5, ancho_vista_hoja_mm=$6, config_anovalum=$7
     WHERE id=$8 AND (user_id IS NULL OR user_id=$9) RETURNING *`,
    [nombre, tipo, descripcion, colores, ancho_vista_marco_mm, ancho_vista_hoja_mm, config_anovalum, id, req.usuario.id]
  );
  if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM series WHERE id=$1 AND user_id=$2', [id, req.usuario.id]);
  res.json({ ok: true });
});

module.exports = router;
