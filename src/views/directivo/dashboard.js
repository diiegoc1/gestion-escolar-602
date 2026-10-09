import { getAlumnos } from '../../services/alumnos.service.js'
import { getDocentes } from '../../services/docentes.service.js'
import { getEventos } from '../../services/eventos.service.js'
import { supabase } from '../../lib/supabase.js'
import { $, esc, fmtFecha, nombreCurso } from '../../utils/helpers.js'
import { calendario } from '../../components/modal.js'

export async function renderDashboard(app) {
  const [{ data: alumnos }, { data: docentes }, { data: eventos }] = await Promise.all([
    getAlumnos(), getDocentes(), getEventos(),
  ])
  const act = (alumnos || []).filter((a) => a.activo)
  const porAnio = [1, 2, 3, 4, 5, 6].map((n) => act.filter((a) => a.cursos?.anio === n).length)
  const max = Math.max(1, ...porAnio)

  // Top 5 inasistencias
  const { data: inas } = await supabase.from('asistencias').select('alumno_id').eq('estado', 'A')
  const conteo = {}
  ;(inas || []).forEach((r) => { conteo[r.alumno_id] = (conteo[r.alumno_id] || 0) + 1 })
  const top = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const mapaAl = Object.fromEntries(act.map((a) => [a.id, a]))
  const alertas = Object.keys(conteo).filter((k) => conteo[k] >= 20).length

  const evs = [...(eventos || [])].sort((a, b) => (a.fecha_inicio < b.fecha_inicio ? -1 : 1))
  const claseEv = { acto: 'acto', examen: 'mesa', feriado: 'cierre', institucional: 'tec' }

  app.innerHTML = `<h1>Dashboard</h1>
  <div class="stats"><div class="stat y"><small>Alumnos</small><b>${act.length}</b></div>
    <div class="stat"><small>Docentes</small><b>${(docentes || []).length}</b></div>
    <div class="stat alert"><small>Alertas (20+ faltas)</small><b>${alertas}</b></div></div>
  <div class="grid2"><section class="card"><h2>Eventos</h2><ul class="events">${evs.map((e) => `<li><i class="sq ${claseEv[e.tipo] || ''}"></i><span><b>${fmtFecha(e.fecha_inicio)}</b> ${esc(e.titulo)}</span></li>`).join('') || '<li class="muted">Sin eventos.</li>'}</ul></section>
    <section class="card" id="cal"></section></div>
  <div class="grid2"><section class="card"><h2>Alumnos por año</h2><div class="bars">${porAnio.map((n, i) => `<div><span>${n}</span><i style="height:${(n / max) * 75}%"></i>${i + 1}°</div>`).join('')}</div></section>
    <section class="card"><h2>Top 5 con más faltas</h2><div class="tbl"><table><tbody>${top.map(([id, f]) => { const a = mapaAl[id]; return `<tr><td>${a ? esc(a.nombre + ' ' + a.apellido) : '—'}</td><td>${a ? esc(nombreCurso(a.cursos)) : ''}</td><td class="neg">${f}</td></tr>` }).join('') || '<tr><td class="muted">Sin inasistencias.</td></tr>'}</tbody></table></div></section></div>`
  calendario($('#cal', app), evs)
}
