# Roles y permisos (BD: DIRECTIVO / DOCENTE / ALUMNO)

- DIRECTIVO: todo — `#/directivo`, alumnos, docentes, cursos, consultas (previas), calendario (eventos)
- DOCENTE: `#/docente/materias`, `#/docente/notas` (calificaciones), `#/docente/asistencia` (asistencias P/A/T)
- ALUMNO: `#/alumno/notas` (mis calificaciones), `#/alumno/asistencia` (mis asistencias)

Auth producción (opción A): Supabase Auth + `usuarios.auth_id`.
El guard normaliza a mayúsculas (`normalizeRol`).

Pasos pendientes en Supabase:
1. Ejecutar `supabase/migration_auth_id.sql` en SQL Editor.
2. Crear cuentas en Authentication con los mismos emails de `usuarios`.
3. Al primer login se auto-vincula `auth_id` por email. Luego pedir reset si hace falta.
