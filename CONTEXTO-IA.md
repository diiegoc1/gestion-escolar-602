# CONTEXTO-IA — EETP 602 Gestión Escolar

Pasale este archivo a cualquier IA para que tenga contexto del proyecto.

## 1. Stack y comandos

- Vite 8.3.4 vanilla JS + `@supabase/supabase-js` 2.117.3
- Router propio hash-based en `src/router.js`, sin framework
- `package.json`: `"type": "module"`, scripts `dev` / `build` / `preview`
- Comandos:
  - `npm install`
  - `copy .env.example .env` (Windows) y completar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - `npm run dev` (puerto 5173), `npm run build` (verificado OK)
- Carpeta proyecto: `eetp602-gestion-escolar/`

## 2. Estructura real

```
index.html                  # <div id="app"> + /src/main.js
vite.config.js              # server.port 5173
src/main.js                 # importa CSS + initRouter(app)
src/router.js               # 12 rutas hash + guards por rol
src/lib/supabase.js         # createClient() único con VITE_SUPABASE_URL/ANON_KEY
src/services/               # consultas Supabase (una por tabla + consultas)
  auth.service.js           # signIn -> loginSimple, signOut, getSession, getRolLocal
  usuarios.service.js       # getUsuarioByEmail, loginSimple, logoutSimple, getUsuarios
  alumnos.service.js        # getAlumnos (join cursos, filtro activo)
  docentes.service.js       # getDocentes
  cursos.service.js         # getCursos
  materias.service.js       # getMaterias, getMateriaById, createMateria
  materias-curso.service.js # getMateriasCurso, getMateriasPorCurso, getMateriasPorDocente
  calificaciones.service.js # getCalificaciones({alumnoId, materiaCursoId}), guardarNota
  asistencias.service.js    # getAsistencias, registrarAsistencia, getInasistenciasPorAlumno (CANÓNICO)
  asistencia.service.js     # COMPAT viejo, misma query a 'asistencias'
  eventos.service.js        # getEventos, createEvento (CANÓNICO)
  calendario.service.js     # COMPAT viejo, misma query a 'eventos'
  previas.service.js        # getPreviasPorAlumno, getPrevias
  consultas.service.js      # contarAlumnosPorCurso, getAlumnosPorCurso, getPreviasConDetalle
src/guards/roleGuard.js     # normalizeRol() a MAYÚSCULAS + canAccess()
src/views/login.js          # form email/password -> signIn -> home por rol
src/views/directivo/        # dashboard, alumnos, docentes, cursos, consultas, calendario
src/views/docente/          # mis-materias, cargar-notas, tomar-asistencia
src/views/alumno/           # mis-notas, mi-asistencia
src/components/             # navbar, sidebar, tabla, formulario, modal (stubs)
src/utils/helpers.js        # formatoFecha es-AR
src/styles/                 # variables.css, global.css mobile-first, components.css
supabase/schema.sql         # referencia de las 10 tablas (ver §4)
supabase/policies.sql       # DEV permisivo, sin RLS real
supabase/seed.sql           # 3 usuarios demo + 1 curso + 2 materias
docs/roles-y-permisos.md    # matriz de roles
public/favicon.ico          # placeholder vacío 0 bytes
docs/der.png                # PENDIENTE (binario, agregar manual)
.env                        # PENDIENTE (copiar de .env.example)
```

## 3. Rutas y roles

- `#/login` (público)
- DIRECTIVO: `#/directivo`, `#/directivo/alumnos`, `#/directivo/docentes`, `#/directivo/cursos`, `#/directivo/consultas`, `#/directivo/calendario`
- DOCENTE (+DIRECTIVO): `#/docente/materias`, `#/docente/notas`, `#/docente/asistencia`
- ALUMNO (+DIRECTIVO): `#/alumno/notas`, `#/alumno/asistencia`
- Rol guardado en `localStorage: rol, usuario_id, email`. Home por rol en `router.js: homePorRol()` y `login.js`.

## 4. Base de datos (10 tablas, nombres exactos)

- `usuarios(id bigint PK, email UNIQUE, password_hash text, rol CHECK DIRECTIVO/DOCENTE/ALUMNO)`
- `cursos(id, anio 1-6, division, turno Mañana/Tarde/Noche, ciclo_lectivo)`
- `materias(id, nombre, anio 1-6)`
- `alumnos(id, usuario_id UNIQUE FK usuarios, curso_id FK cursos, dni UNIQUE, apellido, nombre, fecha_nac, tutor, telefono_tutor, activo DEFAULT true)`
- `docentes(id, usuario_id UNIQUE FK usuarios, dni UNIQUE, apellido, nombre, email, telefono)`
- `materias_curso(id, curso_id! FK cursos, materia_id! FK materias, docente_id FK docentes)` ← join central
- `calificaciones(id, alumno_id! FK alumnos, materia_curso_id! FK materias_curso, trimestre 1-3, nota 1-10)`
- `asistencias(id, alumno_id! FK alumnos, fecha date, estado CHECK P/A/T)` ← plural, sin `curso_id`
- `eventos(id, titulo, tipo acto/examen/feriado/institucional, fecha_inicio, fecha_fin, curso_id NULL FK cursos)` ← no se llama `calendario`, orden por `fecha_inicio`
- `previas(id, alumno_id! FK alumnos, materia_curso_id! FK materias_curso, detalle)`

## 5. Auth simple DEMO

- `loginSimple(email, password)` en `usuarios.service.js`: `select * from usuarios where email`, compara `password_hash === password` en claro (solo demo).
- Seed usa claves en claro: `directivo@eetp602.edu.ar/directivo123`, `docente@eetp602.edu.ar/docente123`, `alumno@eetp602.edu.ar/alumno123`.
- Para producción: migrar a Supabase Auth + columna `usuarios.auth_id uuid` + RLS real.

## 6. Convenciones y errores ya corregidos

- Siempre `from('asistencias')` plural y `from('eventos')`, nunca `asistencia`/`calendario`.
- `materias_curso` con joins `select('*, cursos(*), materias(*), docentes(*)')`.
- No existe columna `alumnos.adeuda`; contar alumnos con `count exact head + eq curso_id + eq activo true`.
- Roles siempre en MAYÚSCULAS en BD; comparar con `normalizeRol()`.

## 7. Pendientes

- Agregar `docs/der.png`, crear `.env`, poner `favicon.ico` real.
- RLS productivo en `policies.sql`, validación de formularios, paginación.
