# CLAUDE.md — Reglas de arquitectura para Teo Comidas

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (base de datos + auth)
- Zustand (estado global del carrito, persistido en localStorage)
- PWA (manifest.json, meta tags)

## Arquitectura y buenas prácticas

- **Separación de responsabilidades:** la lógica de negocio (cálculos, validaciones, reglas de horarios, etc.) va en `/src/lib` o `/src/services`, nunca mezclada directo en los componentes de UI.
- **Tipos centralizados:** todos los tipos de TypeScript van en `/src/lib/types.ts` (o en `/src/types/` si crece). No definir tipos inline sueltos en cada archivo.
- **Manejo de errores explícito:** server actions y llamadas a Supabase/Mercado Pago siempre con try/catch y devolviendo resultados tipados:
  ```ts
  type Result<T> = { success: true; data: T } | { success: false; error: string };
  ```
- **Variables de entorno validadas al arrancar:** usar zod o similar para validar que existan y tengan el formato correcto. No asumir que están bien seteadas.
- **Componentes UI reutilizables** en `/src/components/ui/` (botones, cards, inputs genéricos), separados de los componentes específicos de cada feature que van en `/src/components/`.
- **Nombres consistentes:** kebab-case para archivos (`product-card.tsx`), PascalCase para componentes React (`ProductCard`).
- **No duplicar lógica:** si algo se repite en dos lugares, extraerlo a una función o hook compartido en `/src/lib/` o `/src/hooks/`.
- **Comentarios solo donde no es obvio:** explicar el *por qué*, no el *qué*.
- **Escalabilidad multi-local:** la arquitectura de datos (productos, pedidos, usuarios) debe soportar múltiples locales a futuro sin rehacer el modelo. Pensar en foreign keys a una tabla `locales` desde el principio.

## Estructura de carpetas

```
src/
├── app/            # Rutas (App Router)
│   ├── menu/
│   ├── carrito/
│   ├── checkout/
│   ├── como-retirar/
│   ├── perfil/
│   └── admin/
├── components/     # Componentes específicos de features
│   └── ui/         # Componentes genéricos reutilizables
├── lib/            # Lógica de negocio, utilidades, clientes (supabase, etc.)
├── services/       # Llamadas a APIs externas, server actions
├── hooks/          # Custom hooks compartidos
└── types/          # Tipos TypeScript centralizados (si types.ts crece)
```

## Convenciones de código

- Mobile-first siempre. Diseñar para celular, adaptar a desktop si hace falta.
- Paleta neutra (zinc) por defecto hasta definir colores de marca.
- Tipografía bold sans-serif (Inter).
- Botones y áreas táctiles grandes (mínimo 44px).
- El cliente de Supabase (`src/lib/supabase.ts`) maneja gracefully la ausencia de env vars (usa datos mock como fallback en desarrollo).
