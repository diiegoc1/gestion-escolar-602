# Roles y permisos (BD: DIRECTIVO / DOCENTE / ALUMNO)

- DIRECTIVO: todo — `#/directivo`, alumnos, docentes, cursos, consultas (previas), calendario (eventos)
- DOCENTE: `#/docente/materias`, `#/docente/notas` (calificaciones), `#/docente/asistencia` (asistencias P/A/T)
- ALUMNO: `#/alumno/notas` (mis calificaciones), `#/alumno/asistencia` (mis asistencias)

Login simple DEMO contra tabla `usuarios` (email + password_hash en claro solo para prueba).
El guard normaliza a mayúsculas (`normalizeRol`).
