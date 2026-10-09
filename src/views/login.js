import { signIn } from '../services/auth.service.js'
import { navigate } from '../router.js'

function homePorRol(rol) {
  const r = (rol || '').toUpperCase()
  if (r === 'DIRECTIVO') return '#/directivo'
  if (r === 'DOCENTE') return '#/docente/materias'
  if (r === 'ALUMNO') return '#/alumno/notas'
  return '#/login'
}

export async function renderLogin(app) {
  app.innerHTML = `
    <main class="login-container">
      <h1>EETP 602 - Login</h1>
      <p class="muted">Usa un email de la tabla <code>usuarios</code></p>
      <form id="login-form">
        <input type="email" id="email" placeholder="Email" required />
        <input type="password" id="password" placeholder="Contraseña" required />
        <button type="submit">Ingresar</button>
      </form>
      <p id="login-error" class="error"></p>
    </main>
  `

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value
    const errEl = document.getElementById('login-error')
    errEl.textContent = ''

    const { data, error } = await signIn(email, password)
    if (error) {
      errEl.textContent = error.message
      return
    }
    navigate(homePorRol(data.rol))
  })
}
