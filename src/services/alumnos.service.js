import { supabase } from '../lib/supabase.js'

export async function getAlumnos(soloActivos = true) {
  let q = supabase.from('alumnos').select('*, cursos(*)').order('apellido')
  if (soloActivos) q = q.eq('activo', true)
  return q
}
