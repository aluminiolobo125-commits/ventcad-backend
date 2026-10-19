-- Seed mínimo de catálogo Anovalum (ejecutar después del schema)
INSERT INTO series (id, user_id, nombre, tipo, descripcion, colores, ancho_vista_marco_mm, ancho_vista_hoja_mm, config_anovalum) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 'SERIE 3500 CORREDIZA', 'corredera', 'Corrediza serie 3500.', ARRAY['BLANCO'], 50, 50, 'CORREDIZA DOS HOJAS'),
  ('22222222-2222-2222-2222-222222222222', NULL, 'SERIE 1400 ABATIBLE', 'practicable', 'Ventana abatible serie 1400.', ARRAY['BLANCO'], 42, 42, 'ABATIBLE UNA HOJA');

INSERT INTO perfiles (id, serie_id, codigo, nombre, rol, precio_metro_mxn, precios_por_acabado_usd, medida_barra_m, peso_kg_m) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '3501', 'CERCO INFERIOR', 'marco', 226.00, '{"BLANCO": 14.5}', 6.10, 1.200),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '3502', 'CERCO SUPERIOR', 'marco', 226.00, '{"BLANCO": 14.5}', 6.10, 1.200),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '1402', 'CERCO LISO VENTANA', 'marco', 210.00, '{"BLANCO": 13.0}', 6.10, 1.100),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '1401', 'HOJA LISA VENTANA', 'hoja', 205.00, '{"BLANCO": 12.8}', 6.10, 1.050);

INSERT INTO vidrios (id, nombre, tipo, espesor_mm, precio_m2) VALUES
  ('77777777-7777-7777-7777-777777777777', NULL, 'Vidrio transparente 4 mm', 'transparente', 4, 354.00),
  ('88888888-8888-8888-8888-888888888888', NULL, 'Vidrio Filtrasol 6 mm', 'filtrasol', 6, 482.00);
