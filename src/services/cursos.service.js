import { supabase } from '../lib/supabase.js'

export async function getCursos() {
  return supabase.from('cursos').select('*').order('anio').order('division')
}
