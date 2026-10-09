import { getCursos } from '../../services/cursos.service.js'
import { contarAlumnosPorCurso } from '../../services/consultas.service.js'

export async function renderCursos(app) {
  const { data, error } = await getCursos()
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  let filas = ''
  for (const c of data) {
    const { count } = await contarAlumnosPorCurso(c.id)
    filas += `<tr><td>${c.anio}° ${c.division}</td><td>${c.turno}</td><td>${c.ciclo_lectivo}</td><td>${count ?? '?'}</td></tr>`
  }
  app.innerHTML = `<h2>Cursos</h2><a href="#/directivo">Volver</a>
    <table border="1"><thead><tr><th>Curso</th><th>Turno</th><th>Ciclo</th><th>Alumnos</th></tr></thead><tbody>${filas}</tbody></table>`
}
