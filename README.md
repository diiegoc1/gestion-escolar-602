# EETP 602 - Gestión Escolar

Sistema de gestión escolar con Vite (vanilla JS) + Supabase.

## Requisitos

- Node.js 18+
- Cuenta en Supabase

## Instalación

```bash
npm install
cp .env.example .env
# completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

## Estructura

- `src/main.js` — punto de entrada, inicia el router
- `src/router.js` — navegación entre vistas (hash-based)
- `src/lib/supabase.js` — `createClient()` una sola vez
- `src/services/` — todas las consultas a Supabase
- `src/guards/roleGuard.js` — redirige si el rol no corresponde
- `src/components/` — funciones que devuelven HTML/DOM
- `src/views/` — vistas por rol (directivo / docente / alumno)
- `supabase/` — schema, policies RLS y seed
- `docs/` — DER y roles-y-permisos
