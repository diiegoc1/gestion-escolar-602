import { supabase } from '../lib/supabase.js'

// Compat: nombre viejo. Usar eventos.service.js en código nuevo.
// Tabla real: eventos(id, titulo, tipo, fecha_inicio, fecha_fin, curso_id?)
export async function getEventos() {
  return supabase.from('eventos').select('*').order('fecha_inicio')
}
