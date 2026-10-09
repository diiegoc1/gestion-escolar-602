// Cáscara del diseño: topbar + sidebar. El router decide qué links mostrar por rol.
import { $ } from '../utils/helpers.js'
import { shield } from './modal.js'

export const MENUS = {
  DIRECTIVO: [
    ['Dashboard', '#/directivo'],
    ['Alumnos', '#/directivo/alumnos'],
    ['Docentes', '#/directivo/docentes'],
    ['Cursos', '#/directivo/cursos'],
    ['Consultas', '#/directivo/consultas'],
    ['Calendario', '#/directivo/calendario'],
  ],
  DOCENTE: [
    ['Mis materias', '#/docente/materias'],
    ['Cargar notas', '#/docente/notas'],
    ['Tomar asistencia', '#/docente/asistencia'],
  ],
  ALUMNO: [
    ['Mis notas', '#/alumno/notas'],
    ['Mi asistencia', '#/alumno/asistencia'],
  ],
}

export function menuParaRol(rol) {
  return MENUS[(rol || '').toUpperCase()] || []
}

export function renderNavbar(app, { email, onLogout }) {
  const iniciales = (email || '??').slice(0, 2).toUpperCase()
  app.innerHTML = `<header class="topbar"><button class="burger" id="burger" aria-label="Abrir menú">☰</button>${shield(24)}<span class="brand">EETP Nº 602</span><span class="sp"></span>
    <button class="avatar" id="out" title="Cerrar sesión (${email || ''})" aria-label="Cerrar sesión">${iniciales}</button></header>
    <div class="shell"><nav class="side" id="side"></nav><main class="main" id="view"></main></div>`
  $('#out').onclick = onLogout
  $('#burger').onclick = () => $('#side').classList.toggle('open')
  return $('#view')
}
