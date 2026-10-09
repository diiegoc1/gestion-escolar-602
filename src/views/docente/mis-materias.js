import { supabase } from '../../lib/supabase.js'
import { getMateriasPorDocente } from '../../services/materias-curso.service.js'
import { esc } from '../../utils/helpers.js'

export async function renderMisMaterias(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: doc } = await supabase.from('docentes').select('id, nombre, apellido').eq('usuario_id', usuarioId).single()
  if (!doc) { app.innerHTML = `<h1>Mis materias</h1><p class="muted">Todavía no tenés docente vinculado.</p>`; return }
  const { data, error } = await getMateriasPorDocente(doc.id)
  if (error) { app.innerHTML = `<p>Error: ${esc(error.message)}</p>`; return }
  app.innerHTML = `<h1>Mis materias</h1>
  <div class="card"><div class="tbl"><table><thead><tr><th>Curso</th><th>Materia</th><th>Turno</th></tr></thead><tbody>
  ${(data || []).map((m) => `<tr><td><b>${m.cursos?.anio}° ${esc(m.cursos?.division)}</b></td><td>${esc(m.materias?.nombre)}</td><td>${esc(m.cursos?.turno)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Todavía no tenés materias asignadas.</td></tr>'}
  </tbody></table></div></div>
  <nav><a class="btn" href="#/docente/notas">Cargar notas</a> <a class="btn" href="#/docente/asistencia">Tomar asistencia</a></nav>`
}
