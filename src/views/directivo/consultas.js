import { getCursos } from '../../services/cursos.service.js'
import { contarAlumnosPorCurso, getPreviasConDetalle } from '../../services/consultas.service.js'
import { esc } from '../../utils/helpers.js'

export async function renderConsultas(app) {
  const [{ data: cursos }, { data: previas, error }] = await Promise.all([getCursos(), getPreviasConDetalle()])
  if (error) { app.innerHTML = `<p>Error: ${esc(error.message)}</p>`; return }

  let filasCursos = ''
  for (const c of cursos || []) {
    const { count } = await contarAlumnosPorCurso(c.id)
    filasCursos += `<tr><td><b>${c.anio}° ${esc(c.division)}</b> — ${esc(c.turno)}</td><td>${count ?? '?'}</td></tr>`
  }

  app.innerHTML = `<h1>Consultas</h1>
  <div class="grid2">
  <section class="card"><h2>¿Cuántos alumnos tiene cada curso?</h2><div class="tbl"><table><thead><tr><th>Curso</th><th>Alumnos activos</th></tr></thead><tbody>${filasCursos}</tbody></table></div></section>
  <section class="card"><h2>Previas</h2><div class="tbl"><table><thead><tr><th>Alumno</th><th>Materia</th><th>Detalle</th></tr></thead>
  <tbody>${(previas || []).map((p) => `<tr><td>${esc(p.alumnos?.apellido)} ${esc(p.alumnos?.nombre)}</td><td>${esc(p.materias_curso?.materias?.nombre)}</td><td>${esc(p.detalle)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Sin previas registradas.</td></tr>'}</tbody></table></div></section>
  </div>`
}
