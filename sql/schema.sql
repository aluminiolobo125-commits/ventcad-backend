-- Esquema inicial de VentCAD (PostgreSQL)
-- Ejecutar: psql -d ventcad -f sql/schema.sql
-- Usamos TEXT para los IDs para no depender de la extension pgcrypto

-- Drop en orden inverso a las dependencias para reemplazar tablas existentes
DROP TABLE IF EXISTS presupuesto_ventanas;
DROP TABLE IF EXISTS presupuestos;
DROP TABLE IF EXISTS reglas_herraje;
DROP TABLE IF EXISTS reglas_despiece;
DROP TABLE IF EXISTS vidrios;
DROP TABLE IF EXISTS herrajes;
DROP TABLE IF EXISTS perfiles;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS obras;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'vendedor' CHECK (rol IN ('admin','vendedor')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE clientes (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE obras (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cliente_id TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  direccion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Catálogo base (seed global, user_id NULL = visible para todos)
CREATE TABLE series (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'corredera',
  descripcion TEXT,
  colores TEXT[] DEFAULT ARRAY['BLANCO'],
  ancho_vista_marco_mm INTEGER DEFAULT 50,
  ancho_vista_hoja_mm INTEGER DEFAULT 50,
  config_anovalum TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE perfiles (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  serie_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'marco',
  precio_metro_mxn NUMERIC(12,2) DEFAULT 0,
  precios_por_acabado_usd JSONB DEFAULT '{}',
  medida_barra_m NUMERIC(6,2) DEFAULT 6.10,
  peso_kg_m NUMERIC(8,3) DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE herrajes (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  serie_id TEXT REFERENCES series(id) ON DELETE SET NULL,
  codigo TEXT,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'otro',
  precio_unidad NUMERIC(12,2) DEFAULT 0,
  precio_lista_usd NUMERIC(12,2),
  acabado TEXT,
  unidad TEXT DEFAULT 'ud',
  aplica_a TEXT[] DEFAULT '{}',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE vidrios (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'transparente',
  espesor_mm NUMERIC(6,2) DEFAULT 4,
  precio_m2 NUMERIC(12,2) DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE reglas_despiece (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  serie_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  rol TEXT NOT NULL,
  pieza TEXT NOT NULL,
  formula TEXT NOT NULL,
  repeticiones TEXT NOT NULL,
  descuento_corte_mm NUMERIC(8,2) DEFAULT 0,
  codigo TEXT,
  corte TEXT DEFAULT '90º',
  herraje_codigo TEXT,
  herraje_unidades INTEGER DEFAULT 1,
  descripcion TEXT
);

CREATE TABLE reglas_herraje (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  serie_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  herraje_codigo TEXT NOT NULL,
  cantidad TEXT NOT NULL,
  descripcion TEXT
);

-- Presupuestos (cabecera)
CREATE TABLE presupuestos (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referencia TEXT NOT NULL,
  cliente_id TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  obra_id TEXT REFERENCES obras(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador','enviado','aprobado','facturado')),
  moneda TEXT DEFAULT 'MXN',
  simbolo TEXT DEFAULT '$',
  tipo_cambio_usd NUMERIC(10,4) DEFAULT 18.36,
  descuento_pct NUMERIC(6,2) DEFAULT 0,
  beneficio_pct NUMERIC(6,2) DEFAULT 25,
  iva_pct NUMERIC(6,2) DEFAULT 16,
  total NUMERIC(14,2) DEFAULT 0,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ventanas capturadas dentro de un presupuesto
CREATE TABLE presupuesto_ventanas (
  id TEXT PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::text),
  presupuesto_id TEXT NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  serie_id TEXT REFERENCES series(id) ON DELETE SET NULL,
  color TEXT,
  ancho_mm INTEGER DEFAULT 1200,
  alto_mm INTEGER DEFAULT 1200,
  cantidad INTEGER DEFAULT 1,
  vidrio_id TEXT REFERENCES vidrios(id) ON DELETE SET NULL,
  presupuesto_json JSONB DEFAULT '{}',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presupuestos_user ON presupuestos(user_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_ref ON presupuestos(referencia);
CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_series_user ON series(user_id);
