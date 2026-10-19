const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const resultado = await query(
    'SELECT * FROM clientes WHERE user_id = $1 ORDER BY nombre',
    [req.usuario.id]
  );
  res.json(resultado.rows);
});

router.post('/', async (req, res) => {
  const { nombre, contacto, telefono, email, direccion, ciudad } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  const resultado = await query(
    `INSERT INTO clientes (user_id, nombre, contacto, telefono, email, direccion, ciudad)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.usuario.id, nombre, contacto, telefono, email, direccion, ciudad]
  );
  res.status(201).json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, contacto, telefono, email, direccion, ciudad } = req.body;
  const resultado = await query(
    `UPDATE clientes SET nombre=$1, contacto=$2, telefono=$3, email=$4, direccion=$5, ciudad=$6, actualizado_en=now()
     WHERE id=$7 AND user_id=$8 RETURNING *`,
    [nombre, contacto, telefono, email, direccion, ciudad, id, req.usuario.id]
  );
  if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM clientes WHERE id=$1 AND user_id=$2', [id, req.usuario.id]);
  res.json({ ok: true });
});

module.exports = router;
