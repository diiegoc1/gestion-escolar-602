import { supabase } from '../lib/supabase.js'

// Tabla real: previas(id, alumno_id!, materia_curso_id!, detalle)
export async function getPreviasPorAlumno(alumnoId) {
  let q = supabase.from('previas').select('*, materias_curso(*, materias(*))')
  if (alumnoId) q = q.eq('alumno_id', alumnoId)
  return q
}

export async function getPrevias() {
  return supabase.from('previas').select('*, alumnos(*), materias_curso(*, materias(*))')
}
