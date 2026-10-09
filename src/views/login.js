import { signIn } from '../services/auth.service.js'
import { navigate } from '../router.js'
import { $, esc } from '../utils/helpers.js'
import { shield } from '../components/modal.js'

function homePorRol(rol) {
  const r = (rol || '').toUpperCase()
  if (r === 'DIRECTIVO') return '#/directivo'
  if (r === 'DOCENTE') return '#/docente/materias'
  if (r === 'ALUMNO') return '#/alumno/notas'
  return '#/login'
}

export async function renderLogin(app) {
  document.body.classList.add('login-page')
  app.innerHTML = `
    <form class="login" id="f" novalidate>
      <h1 id="logo">EETP Nº 602</h1>
      <input id="email" type="email" placeholder="Email" autocomplete="username" aria-label="Email">
      <input id="password" type="password" placeholder="Contraseña" autocomplete="current-password" aria-label="Contraseña">
      <p class="err" id="e" hidden></p>
      <button class="btn y">Ingresar</button>
    </form>
  `
  $('#logo').insertAdjacentHTML('afterend', shield(70))

  $('#f').onsubmit = async (e) => {
    e.preventDefault()
    const err = $('#e')
    err.hidden = true
    const email = $('#email').value.trim()
    const password = $('#password').value
    if (!email || !password) { err.textContent = 'Completá email y contraseña.'; err.hidden = false; return }
    const { data, error } = await signIn(email, password)
    if (error) { err.textContent = esc(error.message); err.hidden = false; return }
    document.body.classList.remove('login-page')
    navigate(homePorRol(data.rol))
  }
}
