import { getAsistencias } from '../../services/asistencias.service.js'
import { supabase } from '../../lib/supabase.js'

export async function renderMiAsistencia(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: al } = await supabase.from('alumnos').select('id').eq('usuario_id', usuarioId).single()
  if (!al) { app.innerHTML = `<p>Sin alumno vinculado.</p>`; return }
  const { data, error } = await getAsistencias({ alumnoId: al.id })
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `<h2>Mi Asistencia</h2>
    <table border="1"><thead><tr><th>Fecha</th><th>Estado</th></tr></thead>
    <tbody>${data.map(a => `<tr><td>${a.fecha}</td><td>${a.estado}</td></tr>`).join('')}</tbody></table>`
}
