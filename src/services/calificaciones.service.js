import { supabase } from '../lib/supabase.js'

// Tabla real: calificaciones(id, alumno_id!, materia_curso_id!, trimestre 1-3, nota 1-10)
export async function getCalificaciones({ alumnoId, materiaCursoId } = {}) {
  let q = supabase
    .from('calificaciones')
    .select('*, materias_curso(*, materias(*))')
    .order('trimestre')
  if (alumnoId) q = q.eq('alumno_id', alumnoId)
  if (materiaCursoId) q = q.eq('materia_curso_id', materiaCursoId)
  return q
}

export async function guardarNota(payload) {
  // payload: { alumno_id, materia_curso_id, trimestre, nota }
  return supabase.from('calificaciones').insert(payload).select().single()
}
