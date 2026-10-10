import { renderLogin } from './views/login.js'
import { renderDashboard } from './views/directivo/dashboard.js'
import { renderAlumnos } from './views/directivo/alumnos.js'
import { renderDocentes } from './views/directivo/docentes.js'
import { renderCursos } from './views/directivo/cursos.js'
import { renderConsultas } from './views/directivo/consultas.js'
import { renderCalendario } from './views/directivo/calendario.js'
import { renderMaterias } from './views/directivo/materias.js'
import { renderMisMaterias } from './views/docente/mis-materias.js'
import { renderCargarNotas } from './views/docente/cargar-notas.js'
import { renderTomarAsistencia } from './views/docente/tomar-asistencia.js'
import { renderMisNotas } from './views/alumno/mis-notas.js'
import { renderMiAsistencia } from './views/alumno/mi-asistencia.js'
import { canAccess } from './guards/roleGuard.js'
import { restoreSession, signOut } from './services/auth.service.js'
import { renderNavbar, menuParaRol } from './components/navbar.js'
import { renderSidebar } from './components/sidebar.js'

const routes = {
  '#/login': { render: renderLogin, roles: null },
  '#/directivo': { render: renderDashboard, roles: ['DIRECTIVO'] },
  '#/directivo/alumnos': { render: renderAlumnos, roles: ['DIRECTIVO'] },
  '#/directivo/docentes': { render: renderDocentes, roles: ['DIRECTIVO'] },
  '#/directivo/cursos': { render: renderCursos, roles: ['DIRECTIVO'] },
  '#/directivo/consultas': { render: renderConsultas, roles: ['DIRECTIVO'] },
  '#/directivo/calendario': { render: renderCalendario, roles: ['DIRECTIVO'] },
  '#/directivo/materias': { render: renderMaterias, roles: ['DIRECTIVO'] },
  '#/docente/materias': { render: renderMisMaterias, roles: ['DOCENTE', 'DIRECTIVO'] },
  '#/docente/notas': { render: renderCargarNotas, roles: ['DOCENTE', 'DIRECTIVO'] },
  '#/docente/asistencia': { render: renderTomarAsistencia, roles: ['DOCENTE', 'DIRECTIVO'] },
  '#/alumno/notas': { render: renderMisNotas, roles: ['ALUMNO', 'DIRECTIVO'] },
  '#/alumno/asistencia': { render: renderMiAsistencia, roles: ['ALUMNO', 'DIRECTIVO'] },
}

function getRole() {
  return localStorage.getItem('rol')
}

function homePorRol(rol) {
  const r = (rol || '').toUpperCase()
  if (r === 'DIRECTIVO') return '#/directivo'
  if (r === 'DOCENTE') return '#/docente/materias'
  if (r === 'ALUMNO') return '#/alumno/notas'
  return '#/login'
}

export function navigate(hash) {
  window.location.hash = hash
}

export function initRouter(app) {
  async function render() {
    await restoreSession().catch(() => false)
    const hash = window.location.hash || '#/login'
    const route = routes[hash]

    if (!route) {
      app.innerHTML = `<p>Ruta no encontrada: ${hash}</p><a href="#/login">Ir al login</a>`
      return
    }

    if (route.roles && !canAccess(getRole(), route.roles)) {
      navigate('#/login')
      return
    }

    // Si ya está logueado y va al login, mandar a su home
    if (hash === '#/login' && getRole()) {
      navigate(homePorRol(getRole()))
      return
    }

    app.innerHTML = ''
    if (hash === '#/login') {
      document.body.classList.remove('con-shell')
      await route.render(app)
      return
    }
    // Cáscara del diseño para rutas autenticadas
    document.body.classList.add('con-shell')
    document.body.classList.remove('login-page')
    const view = renderNavbar(app, {
      email: localStorage.getItem('email'),
      onLogout: async () => { await signOut(); navigate('#/login') },
    })
    renderSidebar(menuParaRol(getRole()), hash)
    await route.render(view)
  }

  window.addEventListener('hashchange', render)
  render()
}
