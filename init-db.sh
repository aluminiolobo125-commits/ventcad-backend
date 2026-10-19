#!/bin/bash
# Inicializa el schema y seed en una base de datos PostgreSQL remota (Render, etc.)
# Uso: DATABASE_URL="postgresql://..." ./init-db.sh

if [ -z "$DATABASE_URL" ]; then
  echo "Error: define DATABASE_URL antes de ejecutar."
  echo "Ejemplo: DATABASE_URL='postgresql://u:p@host:5432/db' ./init-db.sh"
  exit 1
fi

echo "-> Aplicando schema..."
psql "$DATABASE_URL" -f sql/schema.sql

echo "-> Aplicando seed..."
psql "$DATABASE_URL" -f sql/seed.sql

echo "-> Listo."
