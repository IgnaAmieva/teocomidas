# Teo Comidas

Web app (PWA) de pedidos online para un local de comida rápida en Tunuyán, Mendoza. Vende pizzas, sanguches y focaccias con masa madre. Dos modalidades de retiro: en el local o Auto Car (pedís desde el auto y te lo dan sin bajarte).

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — diseño mobile-first
- **Supabase** — base de datos PostgreSQL, auth, realtime
- **Zustand** — estado global del carrito (persistido en localStorage)
- **Mercado Pago** — Checkout Pro para pagos
- **PWA** — instalable desde el navegador

## Correr en local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.local.example .env.local

# 3. Completar las variables en .env.local (ver sección abajo)

# 4. Arrancar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Dónde obtenerla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > service_role key (secret) |
| `MP_ACCESS_TOKEN` | Mercado Pago Developers > Tus integraciones > Credenciales de prueba |
| `MP_WEBHOOK_SECRET` | Mercado Pago Developers > Tus integraciones > Webhooks > Secret key |
| `NEXT_PUBLIC_APP_URL` | URL de la app (`http://localhost:3000` en local) |

## Base de datos

Correr los scripts SQL en el SQL Editor de Supabase, en este orden:

1. `supabase/schema.sql` — crea tablas y politicas RLS
2. `supabase/seed.sql` — carga productos de ejemplo

## Estructura de carpetas

```
src/
├── app/                    # Rutas (App Router)
│   ├── page.tsx            # Inicio — selector de modalidad
│   ├── menu/               # Menu de productos por franja horaria
│   ├── carrito/            # Carrito de compras
│   ├── checkout/           # Checkout con datos + pago MP
│   ├── pedido-confirmado/  # Resultado del pago
│   ├── como-retirar/       # Info de modalidades de retiro
│   ├── perfil/             # Perfil del usuario
│   ├── admin/              # Panel admin (login + gestion de pedidos)
│   └── api/                # API routes
│       ├── checkout/       # Crea pedido + preferencia MP
│       ├── mp-webhook/     # Webhook de Mercado Pago
│       └── admin/          # Login y acciones admin
├── components/             # Componentes de UI
│   └── admin/              # Componentes del panel admin
├── hooks/                  # Custom hooks (realtime, notificaciones)
├── lib/                    # Logica de negocio y utilidades
│   ├── supabase.ts         # Cliente publico (browser)
│   ├── supabase-admin.ts   # Cliente service_role (server only)
│   ├── cart-store.ts       # Store Zustand del carrito
│   ├── validations.ts      # Schemas zod
│   └── rate-limit.ts       # Rate limiting in-memory
└── services/               # Integraciones externas
    ├── mercadopago.ts      # API de Mercado Pago
    └── pedidos.ts          # CRUD de pedidos

supabase/
├── schema.sql              # Tablas + RLS
└── seed.sql                # Datos de ejemplo
```

## Panel admin

Acceder en `/admin`. Requiere usuario creado manualmente en Supabase > Authentication > Users.

Vista kanban con 4 columnas: Pendiente, En preparacion, Listo, Entregado. Actualizacion en tiempo real con Supabase Realtime y notificacion sonora cuando entra un pedido nuevo.
