-- DEMO simple: RLS desactivado o políticas permisivas.
-- Para producción: activar RLS y restringir por usuarios.rol.
-- alter table alumnos enable row level security; etc.

-- Ejemplo permisivo (solo DEV):
-- create policy "dev_all" on alumnos for all using (true) with check (true);
-- Repetir para: usuarios, cursos, materias, docentes, materias_curso,
-- calificaciones, asistencias, eventos, previas.
