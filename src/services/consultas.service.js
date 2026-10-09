import { supabase } from '../lib/supabase.js'

// Consultas típicas con esquema real. Sin columna 'adeuda' (no existe).
// "¿cuántos alumnos tiene 4º?" -> contar activos por curso
export async function contarAlumnosPorCurso(cursoId) {
  return supabase
    .from('alumnos')
    .select('id', { count: 'exact', head: true })
    .eq('curso_id', cursoId)
    .eq('activo', true)
}

export async function getAlumnosPorCurso(cursoId) {
  return supabase
    .from('alumnos')
    .select('*')
    .eq('curso_id', cursoId)
    .eq('activo', true)
    .order('apellido')
}

export async function getPreviasConDetalle() {
  return supabase
    .from('previas')
    .select('*, alumnos(apellido, nombre), materias_curso(*, materias(nombre))')
}
