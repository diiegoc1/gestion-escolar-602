import { supabase } from '../lib/supabase.js'

// Join central: materias_curso -> cursos + materias + docentes
export async function getMateriasCurso() {
  return supabase
    .from('materias_curso')
    .select('*, cursos(*), materias(*), docentes(*)')
}

export async function getMateriasPorCurso(cursoId) {
  return supabase
    .from('materias_curso')
    .select('*, materias(*), docentes(*)')
    .eq('curso_id', cursoId)
}

export async function getMateriasPorDocente(docenteId) {
  return supabase
    .from('materias_curso')
    .select('*, cursos(*), materias(*)')
    .eq('docente_id', docenteId)
}
