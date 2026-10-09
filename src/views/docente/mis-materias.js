import { getMateriasPorDocente } from '../../services/materias-curso.service.js'
import { supabase } from '../../lib/supabase.js'

export async function renderMisMaterias(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: doc } = await supabase.from('docentes').select('id').eq('usuario_id', usuarioId).single()
  if (!doc) { app.innerHTML = `<p>Sin docente vinculado.</p>`; return }
  const { data, error } = await getMateriasPorDocente(doc.id)
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `<h2>Mis Materias</h2>
    <table border="1"><thead><tr><th>Curso</th><th>Materia</th></tr></thead>
    <tbody>${data.map(m => `<tr><td>${m.cursos?.anio}° ${m.cursos?.division}</td><td>${m.materias?.nombre}</td></tr>`).join('')}</tbody></table>`
}
