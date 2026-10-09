import { supabase } from '../../lib/supabase.js'
import { getAsistencias } from '../../services/asistencias.service.js'
import { esc, fmtFecha } from '../../utils/helpers.js'

export async function renderMiAsistencia(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: al } = await supabase.from('alumnos').select('id, nombre, apellido').eq('usuario_id', usuarioId).single()
  if (!al) { app.innerHTML = `<h1>Mi asistencia</h1><p class="muted">No encontramos tu legajo. Consultá en dirección.</p>`; return }
  const { data, error } = await getAsistencias({ alumnoId: al.id })
  if (error) { app.innerHTML = `<p>Error: ${esc(error.message)}</p>`; return }
  const c = (v) => (data || []).filter((a) => a.estado === v).length
  const nombre = { P: 'Presente', A: 'Ausente', T: 'Tarde' }
  app.innerHTML = `<h1>Mi asistencia</h1>
  <div class="card"><div class="summary" style="margin-bottom:12px"><span>Presentes: ${c('P')}</span><span class="neg">Ausentes: ${c('A')}</span><span>Tardes: ${c('T')}</span></div>
  <div class="tbl"><table><thead><tr><th>Fecha</th><th>Estado</th></tr></thead><tbody>
  ${(data || []).map((a) => `<tr><td>${fmtFecha(a.fecha)}</td><td>${nombre[a.estado] || a.estado}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">Sin registros.</td></tr>'}
  </tbody></table></div></div>`
}
