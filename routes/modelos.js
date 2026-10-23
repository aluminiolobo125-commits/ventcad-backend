const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');
const { manejarError } = require('../utils/error');

const router = express.Router();
router.use(autenticar);

/** Convierte una fila de la BD al formato que usa el frontend. */
function aModelo(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    serieId: fila.serie_id,
    color: fila.color || 'BLANCO',
    anchoMM: Number(fila.ancho_mm),
    altoMM: Number(fila.alto_mm),
    alturaTravesanoMM: fila.altura_travesano_mm === null ? null : Number(fila.altura_travesano_mm),
    vidrioId: fila.vidrio_id || '',
    cantidad: Number(fila.cantidad),
    hojas: fila.hojas || [],
    creadaEn: fila.creado_en,
  };
}

router.get('/', async (req, res) => {
  try {
    const resultado = await query(
      'SELECT * FROM modelos_ventana WHERE user_id = $1 ORDER BY serie_id, creado_en DESC',
      [req.usuario.id]
    );
    res.json(resultado.rows.map(aModelo));
  } catch (e) {
    manejarError(res, e);
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, serieId, color, anchoMM, altoMM, alturaTravesanoMM, vidrioId, cantidad, hojas } = req.body;
    if (!nombre || !serieId) {
      return res.status(400).json({ error: 'Nombre y serie son obligatorios' });
    }
    const resultado = await query(
      `INSERT INTO modelos_ventana
        (user_id, nombre, serie_id, color, ancho_mm, alto_mm, altura_travesano_mm, vidrio_id, cantidad, hojas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.usuario.id,
        nombre,
        serieId,
        color || 'BLANCO',
        anchoMM || 1200,
        altoMM || 1200,
        alturaTravesanoMM ?? null,
        vidrioId || null,
        cantidad || 1,
        JSON.stringify(Array.isArray(hojas) ? hojas : []),
      ]
    );
    res.status(201).json(aModelo(resultado.rows[0]));
  } catch (e) {
    manejarError(res, e);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const resultado = await query(
      `UPDATE modelos_ventana SET nombre=$1, actualizado_en=now()
       WHERE id=$2 AND user_id=$3 RETURNING *`,
      [nombre, id, req.usuario.id]
    );
    if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(aModelo(resultado.rows[0]));
  } catch (e) {
    manejarError(res, e);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM modelos_ventana WHERE id=$1 AND user_id=$2', [req.params.id, req.usuario.id]);
    res.json({ ok: true });
  } catch (e) {
    manejarError(res, e);
  }
});

module.exports = router;
