import { supabase } from '../lib/supabase.js'

// Tabla real: eventos(id, titulo, tipo acto/examen/feriado/institucional, fecha_inicio, fecha_fin, curso_id?)
export async function getEventos(cursoId) {
  let q = supabase.from('eventos').select('*').order('fecha_inicio')
  if (cursoId) q = q.eq('curso_id', cursoId)
  return q
}

export async function createEvento(payload) {
  return supabase.from('eventos').insert(payload).select().single()
}
