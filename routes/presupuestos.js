const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const resultado = await query(
    `SELECT p.*, c.nombre AS cliente_nombre, o.nombre AS obra_nombre
     FROM presupuestos p
     LEFT JOIN clientes c ON c.id = p.cliente_id
     LEFT JOIN obras o ON o.id = p.obra_id
     WHERE p.user_id = $1
     ORDER BY p.creado_en DESC`,
    [req.usuario.id]
  );
  const presupuestos = [];
  for (const p of resultado.rows) {
    const ventanas = await query(
      'SELECT * FROM presupuesto_ventanas WHERE presupuesto_id=$1 ORDER BY creado_en',
      [p.id]
    );
    presupuestos.push({ ...p, ventanas: ventanas.rows });
  }
  res.json(presupuestos);
});

router.post('/', async (req, res) => {
  const { referencia, cliente_id, obra_id, moneda, simbolo, tipo_cambio_usd, descuento_pct, beneficio_pct, iva_pct, total, ventanas } = req.body;
  const resultado = await query(
    `INSERT INTO presupuestos (user_id, referencia, cliente_id, obra_id, moneda, simbolo, tipo_cambio_usd, descuento_pct, beneficio_pct, iva_pct, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [req.usuario.id, referencia, cliente_id, obra_id, moneda, simbolo, tipo_cambio_usd, descuento_pct, beneficio_pct, iva_pct, total]
  );
  const presupuesto = resultado.rows[0];
  if (Array.isArray(ventanas)) {
    for (const v of ventanas) {
      await query(
        `INSERT INTO presupuesto_ventanas (presupuesto_id, nombre, serie_id, color, ancho_mm, alto_mm, cantidad, vidrio_id, presupuesto_json)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [presupuesto.id, v.nombre, v.serie_id, v.color, v.ancho_mm, v.alto_mm, v.cantidad, v.vidrio_id, JSON.stringify(v.presupuesto_json || {})]
      );
    }
  }
  res.status(201).json(presupuesto);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const p = await query('SELECT * FROM presupuestos WHERE id=$1 AND user_id=$2', [id, req.usuario.id]);
  if (p.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  const ventanas = await query('SELECT * FROM presupuesto_ventanas WHERE presupuesto_id=$1 ORDER BY creado_en', [id]);
  res.json({ ...p.rows[0], ventanas: ventanas.rows });
});

router.patch('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const resultado = await query(
    'UPDATE presupuestos SET estado=$1, actualizado_en=now() WHERE id=$2 AND user_id=$3 RETURNING *',
    [estado, id, req.usuario.id]
  );
  if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(resultado.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM presupuestos WHERE id=$1 AND user_id=$2', [id, req.usuario.id]);
  res.json({ ok: true });
});

module.exports = router;
