import { guardarNota } from '../../services/calificaciones.service.js'

export async function renderCargarNotas(app) {
  app.innerHTML = `
    <h2>Cargar Notas</h2>
    <form id="nota-form">
      <input name="alumno_id" placeholder="alumno_id" required />
      <input name="materia_curso_id" placeholder="materia_curso_id" required />
      <input name="trimestre" type="number" min="1" max="3" placeholder="1-3" required />
      <input name="nota" type="number" min="1" max="10" step="0.01" placeholder="1-10" required />
      <button>Cargar</button>
    </form><p id="msg"></p>
  `
  document.getElementById('nota-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = { alumno_id: +fd.get('alumno_id'), materia_curso_id: +fd.get('materia_curso_id'), trimestre: +fd.get('trimestre'), nota: +fd.get('nota') }
    const { error } = await guardarNota(payload)
    document.getElementById('msg').textContent = error ? error.message : 'Guardada'
  })
}
