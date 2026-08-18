# Bahia 105w

Ecommerce boutique con panel de administración. Bordados hechos a mano, inspirados en el arte mexicano.

## Stack técnico

- **Next.js 16** (App Router) + React 19 + TypeScript
- **TailwindCSS 4** + **shadcn/ui** (componentes)
- **Prisma 7** + **PostgreSQL** (Supabase) — ORM y base de datos
- **NextAuth v5** — login con Google OAuth y email/contraseña
- **Zustand** — estado del carrito (persistido en localStorage)
- **Zod** — validación de formularios y server actions
- **Resend** — envío de emails transaccionales (notificación de pedido)
- **react-icons** — íconos

## Estructura del proyecto

```
app/
  page.tsx                 → Home (vitrina, hero, catálogo destacado)
  categoria/[slug]/        → Listado de productos por categoría
  producto/[slug]/         → Detalle de producto
  carrito/                 → Carrito de compras
  checkout/                → Checkout y confirmación de pedido
  login/                   → Login / registro de cuenta
  cuenta/favoritos/        → Favoritos del cliente
  cuenta/pedidos/          → Historial de pedidos del cliente
  admin/                   → Panel de administración (protegido, rol ADMIN)
    productos/              CRUD de productos y variantes
    categorias/             CRUD de categorías
    banners/                Gestión de Hero / Flyers / Banners
    pedidos/                Listado de pedidos y cambio de estado
  api/auth/                → Endpoints de NextAuth y registro

components/
  shop/                    → Componentes de tienda (header, footer, cards, carrito)
  admin/                   → Componentes del panel admin (forms, tablas)
  account/                 → Login/registro
  ui/                      → Componentes shadcn/ui

lib/
  prisma.ts                → Cliente Prisma
  catalog.ts                → Queries de catálogo (productos, categorías, banners)
  cart-store.ts             → Store del carrito (Zustand)
  email.ts                  → Envío de notificación de pedido
  supabase.ts                → Cliente de Supabase Storage (subida de imágenes)
  actions/                  → Server actions (pedidos, favoritos, admin)
  validations/               → Esquemas Zod

prisma/
  schema.prisma             → Modelo de datos
  migrations/                → Migraciones SQL
  seed.ts                     → Datos de ejemplo + usuario admin
```

## Setup local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y completar las variables (ver abajo).
3. Aplicar migraciones:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
4. (Opcional) Cargar datos de ejemplo y usuario admin:
   ```bash
   npm run seed
   ```
5. Levantar el servidor:
   ```bash
   npm run dev
   ```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de Postgres (pooler, para queries) |
| `DIRECT_URL` | Connection string directa (para migraciones) |
| `AUTH_SECRET` | Secret de NextAuth (generar con `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciales OAuth de Google |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (para Storage de imágenes) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase (subida de imágenes desde admin) |
| `RESEND_API_KEY` | API key de Resend (notificación de pedido nuevo) |
| `VENDOR_EMAIL` | Email del vendedor que recibe la notificación de cada pedido |
| `EMAIL_FROM` | Remitente del email (opcional, default `pedidos@boutiquemex.mx`) |

Si `RESEND_API_KEY` o `VENDOR_EMAIL` no están configuradas, la notificación de pedido se omite (queda logueada en consola) sin romper el checkout.

Si `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` no están configuradas, el panel admin funciona igual pegando la URL de la imagen manualmente (sin subida de archivo).

## Panel de administración

- URL: `/admin` (redirige a `/login` si no hay sesión con rol `ADMIN`).
- Usuario de ejemplo creado por el seed: `admin@boutiquemex.mx` / `boutiquemex2026` — **cambiar la contraseña antes de producción** (o eliminar el usuario y crear uno nuevo actualizando el campo `role` a `ADMIN` en la tabla `User`).
- **Productos**: alta/edición/baja, variantes por color y talla con stock individual, imagen por variante (URL).
- **Categorías**: alta/edición/baja. El slug se usa en la URL (`/categoria/<slug>`).
- **Vitrina**: gestión de imágenes del Hero (portada), Flyers y Banners promocionales, con orden y link opcional.
- **Pedidos**: listado con datos de contacto del comprador y cambio de estado (Pendiente → Confirmado → Completado). El cobro y envío se coordinan manualmente por fuera de la plataforma (WhatsApp/email) — no hay pasarela de pago integrada.
- Cada pedido nuevo dispara un email al vendedor (`VENDOR_EMAIL`) con los datos de contacto del comprador.

## Notas de alcance

- Sin pasarela de pago: el checkout registra el pedido y los datos de contacto; el cobro se gestiona por fuera.
- El stock se controla manualmente desde el panel admin; no se descuenta automáticamente al confirmar un pedido (la venta se cierra manualmente).

## Garantía

1 mes de garantía post-entrega sobre bugs de las funcionalidades implementadas en este alcance.
