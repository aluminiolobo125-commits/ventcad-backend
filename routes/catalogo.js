const express = require('express');
const { query } = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar);

router.get('/series', async (req, res) => {
  const resultado = await query(
    'SELECT * FROM series WHERE user_id IS NULL OR user_id = $1 ORDER BY nombre',
    [req.usuario.id]
  );
  res.json(resultado.rows);
});

router.get('/perfiles/:serieId', async (req, res) => {
  const { serieId } = req.params;
  const resultado = await query('SELECT * FROM perfiles WHERE serie_id = $1 ORDER BY codigo', [serieId]);
  res.json(resultado.rows);
});

router.get('/vidrios', async (req, res) => {
  const resultado = await query('SELECT * FROM vidrios ORDER BY nombre');
  res.json(resultado.rows);
});

module.exports = router;
