import { supabase } from '../lib/supabase.js'

// Compat: nombre viejo en singular. Usar asistencias.service.js en código nuevo.
// Tabla real: asistencias(id, alumno_id!, fecha, estado P/A/T)
export async function getAsistencia(alumnoId, fecha) {
  let q = supabase.from('asistencias').select('*').order('fecha', { ascending: false })
  if (alumnoId) q = q.eq('alumno_id', alumnoId)
  if (fecha) q = q.eq('fecha', fecha)
  return q
}
