-- Seed DEMO (password_hash en claro solo para prueba simple).
insert into usuarios (email, password_hash, rol) values
  ('directivo@eetp602.edu.ar', 'directivo123', 'DIRECTIVO'),
  ('docente@eetp602.edu.ar', 'docente123', 'DOCENTE'),
  ('alumno@eetp602.edu.ar', 'alumno123', 'ALUMNO')
on conflict (email) do nothing;

insert into cursos (anio, division, turno, ciclo_lectivo) values
  (4, 'A', 'Mañana', 2026)
on conflict do nothing;

insert into materias (nombre, anio) values
  ('Matemática', 4),
  ('Lengua', 4)
on conflict do nothing;
