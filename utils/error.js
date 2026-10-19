function manejarError(res, err, codigo = 500, mensaje = 'Error interno del servidor') {
  console.error('[error]', err);
  res.status(codigo).json({ error: mensaje, detalle: err.message || String(err) });
}

module.exports = { manejarError };
