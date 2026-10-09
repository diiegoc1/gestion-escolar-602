import { registrarAsistencia } from '../../services/asistencias.service.js'

export async function renderTomarAsistencia(app) {
  app.innerHTML = `
    <h2>Tomar Asistencia (P/A/T)</h2>
    <form id="asi-form">
      <input name="alumno_id" placeholder="alumno_id" required />
      <input name="fecha" type="date" required />
      <select name="estado"><option>P</option><option>A</option><option>T</option></select>
      <button>Guardar</button>
    </form><p id="msg"></p>
  `
  document.getElementById('fecha').value = new Date().toISOString().slice(0, 10)
  document.getElementById('asi-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const { error } = await registrarAsistencia({ alumno_id: +fd.get('alumno_id'), fecha: fd.get('fecha'), estado: fd.get('estado') })
    document.getElementById('msg').textContent = error ? error.message : 'Guardada'
  })
}
