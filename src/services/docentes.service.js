import { supabase } from '../lib/supabase.js'

export async function getDocentes() {
  return supabase.from('docentes').select('*').order('apellido')
}
