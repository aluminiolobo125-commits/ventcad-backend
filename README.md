# VentCAD Backend (Express + PostgreSQL)

Backend multi-usuario listo para desplegar en **Render** (tier gratuito).

## Variables de entorno (`.env`)

```
PORT=4000
JWT_SECRET=cambia_esta_clave_secreta_en_produccion
DATABASE_URL=postgresql://usuario:password@host:5432/ventcad
```

## Despliegue gratis en Render

1. Crea una **Base de Datos PostgreSQL** en Render (tipo "PostgreSQL", plan Free).
2. Copia la **External Database URL** que te da Render y pégala en `DATABASE_URL` del servicio web.
3. Crea un **Web Service** conectando tu repo de GitHub, carpeta raíz `backend`.
4. Comando de build: `npm install`
5. Comando de start: `npm start`
6. Añade las variables de entorno (`PORT`, `JWT_SECRET`, `DATABASE_URL`) en el panel de Render.
7. Ejecuta el schema una vez (por la consola de Render o localmente con `DATABASE_URL` de Render):

```bash
psql "TU_DATABASE_URL_DE_RENDER" -f sql/schema.sql
psql "TU_DATABASE_URL_DE_RENDER" -f sql/seed.sql
```

## Endpoints principales

- `GET /api/health`
- `POST /api/auth/registro`  (body: email, password, nombre)
- `POST /api/auth/login`      (body: email, password)
- `GET /api/auth/me`          (Header: Authorization: Bearer <token>)
- `GET /api/clientes`         (autenticado)
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`
- `GET /api/presupuestos`
- `POST /api/presupuestos`    (body: referencia, cliente_id, obra_id, total, ventanas[])
- `GET /api/presupuestos/:id`
- `PATCH /api/presupuestos/:id/estado`
- `DELETE /api/presupuestos/:id`
- `GET /api/catalogo/series`
- `GET /api/catalogo/perfiles/:serieId`
- `GET /api/catalogo/vidrios`
- `GET /api/perfiles-imagenes/:codigo.png` — sirve la imagen de sección del perfil desde `public/perfiles`

Todos los endpoints excepto `/api/auth/*` requieren token JWT en `Authorization: Bearer <token>`.

## Integrar con el frontend actual

El frontend de VentCAD (`src/`) aún usa `localStorage`. Para conectarlo a este backend:

1. Reemplaza `useStore` para que lea/escriba contra `/api/...` en vez de `localStorage`.
2. Añade un flujo de login/registro al inicio (pantalla de auth).
3. Guarda el JWT en `localStorage` solo para la sesión del navegador.
4. Cada request incluye `Authorization: Bearer <token>`.

Los cálculos de presupuesto (`src/domain/quote.ts`) y los PDFs (`src/lib/pdf.ts`) se pueden reutilizar: el frontend calcula y envía el JSON al backend para guardar.
