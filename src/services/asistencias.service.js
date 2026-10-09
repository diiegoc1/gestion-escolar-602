import { supabase } from '../lib/supabase.js'

// Tabla real: asistencias(id, alumno_id!, fecha, estado P/A/T)
export async function getAsistencias({ alumnoId, fecha } = {}) {
  let q = supabase.from('asistencias').select('*').order('fecha', { ascending: false })
  if (alumnoId) q = q.eq('alumno_id', alumnoId)
  if (fecha) q = q.eq('fecha', fecha)
  return q
}

export async function registrarAsistencia(payload) {
  // payload: { alumno_id, fecha, estado }
  return supabase.from('asistencias').insert(payload).select().single()
}

export async function getInasistenciasPorAlumno(alumnoId) {
  return supabase.from('asistencias').select('*').eq('alumno_id', alumnoId).eq('estado', 'A')
}
