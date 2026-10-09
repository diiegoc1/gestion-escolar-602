import { supabase } from '../../lib/supabase.js'
import { getCalificaciones } from '../../services/calificaciones.service.js'
import { getEventos } from '../../services/eventos.service.js'
import { esc, fmtFecha, hoy, promedio, estado, nombreCurso } from '../../utils/helpers.js'

export async function renderMisNotas(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: al } = await supabase.from('alumnos').select('id, nombre, apellido, curso_id, cursos(*)').eq('usuario_id', usuarioId).single()
  if (!al) { app.innerHTML = `<h1>Mis notas</h1><p class="muted">No encontramos tu legajo. Consultá en dirección.</p>`; return }
  const [{ data: notas }, { data: evs }, { data: asis }] = await Promise.all([
    getCalificaciones({ alumnoId: al.id }),
    getEventos(),
    supabase.from('asistencias').select('estado').eq('alumno_id', al.id),
  ])

  const porMat = {}
  ;(notas || []).forEach((n) => {
    const k = n.materia_curso_id
    ;(porMat[k] ??= { nombre: n.materias_curso?.materias?.nombre || '—', t: {} })[n.trimestre] = n.nota
    porMat[k].t[n.trimestre] = n.nota
  })
  const rows = Object.values(porMat).map((r) => {
    const n = [1, 2, 3].map((t) => r.t[t] ?? null)
    const p = promedio(n)
    return { ...r, n, p, e: estado(p) }
  })
  const ok = rows.filter((r) => r.e === 'Aprobado').length
  const f = (asis || []).reduce((s, r) => s + (r.estado === 'A' ? 1 : r.estado === 'T' ? 0.5 : 0), 0)
  const pct = Math.min(100, (f / 20) * 100)
  const prox = (evs || []).filter((e) => e.fecha_inicio >= hoy()).sort((x, y) => (x.fecha_inicio < y.fecha_inicio ? -1 : 1)).slice(0, 5)
  const claseEv = { acto: 'acto', examen: 'mesa', feriado: 'cierre', institucional: 'tec' }

  app.innerHTML = `<div class="head"><h1>Mis notas</h1><button class="btn noprint" onclick="print()">Imprimir / guardar PDF</button></div>
  <section class="card boletin"><h2>Boletín de ${esc(al.nombre)} ${esc(al.apellido)} — ${esc(nombreCurso(al.cursos))}</h2>
  <div class="tbl"><table><thead><tr><th>Materia</th><th>1°</th><th>2°</th><th>3°</th><th>Prom.</th><th>Estado</th></tr></thead><tbody>
  ${rows.map((r) => `<tr><td>${esc(r.nombre)}</td>${r.n.map((x) => `<td class="${x != null && x < 6 ? 'neg' : ''}">${x ?? '-'}</td>`).join('')}<td>${r.p == null ? '-' : r.p.toFixed(2)}</td><td><span class="badge ${r.e}">${r.e}</span></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Sin notas cargadas.</td></tr>'}
  </tbody></table></div><p><b>Aprobadas:</b> ${ok} · <b class="neg">Con instancia pendiente:</b> ${rows.length - ok}</p>
  <h2>Asistencia</h2><div class="meter" role="progressbar" aria-valuenow="${f}" aria-valuemax="20"><i class="${f >= 15 ? 'hot' : ''}" style="width:${pct}%"></i></div>
  <span class="muted">${f} inasistencias de 20 permitidas</span></section>
  <section class="card boletin"><h2>Próximas fechas</h2><ul class="events">${prox.map((e) => `<li><i class="sq ${claseEv[e.tipo] || ''}"></i><span><b>${fmtFecha(e.fecha_inicio)}</b> ${esc(e.titulo)}</span></li>`).join('') || '<li class="muted">No hay fechas próximas cargadas.</li>'}</ul></section>`
}
