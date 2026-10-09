import { getCalificaciones } from '../../services/calificaciones.service.js'
import { supabase } from '../../lib/supabase.js'

export async function renderMisNotas(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: al } = await supabase.from('alumnos').select('id').eq('usuario_id', usuarioId).single()
  if (!al) { app.innerHTML = `<p>Sin alumno vinculado.</p>`; return }
  const { data, error } = await getCalificaciones({ alumnoId: al.id })
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `<h2>Mis Notas</h2>
    <table border="1"><thead><tr><th>Materia</th><th>Tri</th><th>Nota</th></tr></thead>
    <tbody>${data.map(c => `<tr><td>${c.materias_curso?.materias?.nombre ?? c.materia_curso_id}</td><td>${c.trimestre}</td><td>${c.nota}</td></tr>`).join('')}</tbody></table>`
}
