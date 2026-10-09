import { getAlumnos } from '../../services/alumnos.service.js'
import { getCursos } from '../../services/cursos.service.js'
import { getDocentes } from '../../services/docentes.service.js'

export async function renderDashboard(app) {
  const [al, cu, do_] = await Promise.all([getAlumnos(), getCursos(), getDocentes()])
  app.innerHTML = `
    <h2>Dashboard Directivo</h2>
    <nav><a href="#/directivo/alumnos">Alumnos</a> | <a href="#/directivo/docentes">Docentes</a> | <a href="#/directivo/cursos">Cursos</a> | <a href="#/directivo/consultas">Consultas</a> | <a href="#/directivo/calendario">Calendario</a> | <a href="#/login">Salir</a></nav>
    <p>Alumnos activos: ${al.data?.length ?? '?'} | Cursos: ${cu.data?.length ?? '?'} | Docentes: ${do_.data?.length ?? '?'}</p>
  `
}
