const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const resultado = await query(
    `SELECT o.*, c.nombre AS cliente_nombre
     FROM obras o
     LEFT JOIN clientes c ON c.id = o.cliente_id
     WHERE o.user_id = $1
     ORDER BY o.nombre`,
    [req.usuario.id]
  );
  res.json(resultado.rows);
});

router.post('/', async (req, res) => {
  const { nombre, cliente_id, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  const resultado = await query(
    `INSERT INTO obras (user_id, cliente_id, nombre, direccion)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.usuario.id, cliente_id, nombre, direccion]
  );
  res.status(201).json(resultado.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cliente_id, direccion } = req.body;
  const resultado = await query(
    `UPDATE obras SET nombre=$1, cliente_id=$2, direccion=$3, creado_en=now()
     WHERE id=$4 AND user_id=$5 RETURNING *`,
    [nombre, cliente_id, direccion, id, req.usuario.id]
  );
  if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM obras WHERE id=$1 AND user_id=$2', [id, req.usuario.id]);
  res.json({ ok: true });
});

module.exports = router;
