-- Migración a Supabase Auth (opción A). Ejecutar en Supabase → SQL Editor.
-- 1) Agrega auth_id y lo vincula con auth.users. 2) Crea helper + RLS real.

alter table public.usuarios
  add column if not exists auth_id uuid unique references auth.users(id) on delete set null;

create index if not exists usuarios_auth_id_idx on public.usuarios(auth_id);

-- Helper: ¿el usuario logueado es DIRECTIVO?
create or replace function public.es_directivo()
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.usuarios
    where auth_id = auth.uid() and rol = 'DIRECTIVO'
  );
$$;

-- RLS en todas las tablas
alter table public.usuarios enable row level security;
alter table public.cursos enable row level security;
alter table public.materias enable row level security;
alter table public.alumnos enable row level security;
alter table public.docentes enable row level security;
alter table public.materias_curso enable row level security;
alter table public.calificaciones enable row level security;
alter table public.asistencias enable row level security;
alter table public.eventos enable row level security;
alter table public.previas enable row level security;

-- Limpieza de policies demo anteriores (si existen)
drop policy if exists "demo_select_anon" on public.usuarios;
drop policy if exists "dev_all" on public.usuarios;
drop policy if exists "dev_all" on public.alumnos;
drop policy if exists "dev_all" on public.cursos;
drop policy if exists "dev_all" on public.materias;
drop policy if exists "dev_all" on public.docentes;
drop policy if exists "dev_all" on public.materias_curso;
drop policy if exists "dev_all" on public.calificaciones;
drop policy if exists "dev_all" on public.asistencias;
drop policy if exists "dev_all" on public.eventos;
drop policy if exists "dev_all" on public.previas;

-- USUARIOS: cada uno ve su fila (por auth_id o por email del JWT, para auto-vincular),
-- directivo ve todo. Update permitido para vincular auth_id.
drop policy if exists "usuarios_select" on public.usuarios;
create policy "usuarios_select" on public.usuarios for select to authenticated
  using (auth_id = auth.uid()
     or email = (auth.jwt() ->> 'email')
     or public.es_directivo());

drop policy if exists "usuarios_update_link" on public.usuarios;
create policy "usuarios_update_link" on public.usuarios for update to authenticated
  using (auth_id = auth.uid()
     or (auth_id is null and email = (auth.jwt() ->> 'email'))
     or public.es_directivo())
  with check (auth_id = auth.uid()
     or (auth_id is null and email = (auth.jwt() ->> 'email'))
     or public.es_directivo());

drop policy if exists "usuarios_directivo_all" on public.usuarios;
create policy "usuarios_directivo_all" on public.usuarios for all to authenticated
  using (public.es_directivo()) with check (public.es_directivo());

-- LECTURA: cualquier logueado puede leer datos escolares (intranet)
drop policy if exists "lectura_autenticados" on public.cursos;
create policy "lectura_autenticados" on public.cursos for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.materias;
create policy "lectura_autenticados" on public.materias for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.alumnos;
create policy "lectura_autenticados" on public.alumnos for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.docentes;
create policy "lectura_autenticados" on public.docentes for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.materias_curso;
create policy "lectura_autenticados" on public.materias_curso for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.calificaciones;
create policy "lectura_autenticados" on public.calificaciones for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.asistencias;
create policy "lectura_autenticados" on public.asistencias for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.eventos;
create policy "lectura_autenticados" on public.eventos for select to authenticated using (true);
drop policy if exists "lectura_autenticados" on public.previas;
create policy "lectura_autenticados" on public.previas for select to authenticated using (true);

-- ESCRITURA DIRECTIVO: todo
drop policy if exists "escritura_directivo" on public.cursos;
create policy "escritura_directivo" on public.cursos for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.materias;
create policy "escritura_directivo" on public.materias for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.alumnos;
create policy "escritura_directivo" on public.alumnos for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.docentes;
create policy "escritura_directivo" on public.docentes for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.materias_curso;
create policy "escritura_directivo" on public.materias_curso for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.eventos;
create policy "escritura_directivo" on public.eventos for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.previas;
create policy "escritura_directivo" on public.previas for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.calificaciones;
create policy "escritura_directivo" on public.calificaciones for all to authenticated using (public.es_directivo()) with check (public.es_directivo());
drop policy if exists "escritura_directivo" on public.asistencias;
create policy "escritura_directivo" on public.asistencias for all to authenticated using (public.es_directivo()) with check (public.es_directivo());

-- ESCRITURA DOCENTE: solo calificaciones y asistencias
drop policy if exists "docente_calificaciones" on public.calificaciones;
create policy "docente_calificaciones" on public.calificaciones for insert to authenticated
  with check (exists(select 1 from public.usuarios u where u.auth_id = auth.uid() and u.rol in ('DOCENTE','DIRECTIVO')));
drop policy if exists "docente_calificaciones_upd" on public.calificaciones;
create policy "docente_calificaciones_upd" on public.calificaciones for update to authenticated
  using (exists(select 1 from public.usuarios u where u.auth_id = auth.uid() and u.rol in ('DOCENTE','DIRECTIVO')))
  with check (exists(select 1 from public.usuarios u where u.auth_id = auth.uid() and u.rol in ('DOCENTE','DIRECTIVO')));

drop policy if exists "docente_asistencias" on public.asistencias;
create policy "docente_asistencias" on public.asistencias for insert to authenticated
  with check (exists(select 1 from public.usuarios u where u.auth_id = auth.uid() and u.rol in ('DOCENTE','DIRECTIVO')));
drop policy if exists "docente_asistencias_upd" on public.asistencias;
create policy "docente_asistencias_upd" on public.asistencias for update to authenticated
  using (exists(select 1 from public.usuarios u where u.auth_id = auth.uid() and u.rol in ('DOCENTE','DIRECTIVO')))
  with check (exists(select 1 from public.usuarios u where u.auth_id = auth.uid() and u.rol in ('DOCENTE','DIRECTIVO')));
