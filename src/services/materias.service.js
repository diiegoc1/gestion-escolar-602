import { supabase } from '../lib/supabase.js'

// Tablas reales: materias(id, nombre, anio) + materias_curso(id, curso_id!, materia_id!, docente_id)
export async function getMaterias() {
  return supabase.from('materias').select('*').order('anio').order('nombre')
}

export async function getMateriaById(id) {
  return supabase.from('materias').select('*').eq('id', id).single()
}

export async function createMateria(payload) {
  return supabase.from('materias').insert(payload).select().single()
}
