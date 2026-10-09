import { supabase } from '../../lib/supabase.js'
import { getMateriasPorDocente } from '../../services/materias-curso.service.js'
import { $, $$, esc, hoy } from '../../utils/helpers.js'
import { toast } from '../../components/modal.js'

export async function renderTomarAsistencia(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: doc } = await supabase.from('docentes').select('id').eq('usuario_id', usuarioId).single()
  if (!doc) { app.innerHTML = `<h1>Asistencia</h1><p class="muted">Todavía no tenés docente vinculado.</p>`; return }
  const { data: mats, error } = await getMateriasPorDocente(doc.id)
  if (error) { app.innerHTML = `<p>Error: ${esc(error.message)}</p>`; return }
  const vistos = new Map()
  ;(mats || []).forEach((m) => { if (!vistos.has(m.curso_id)) vistos.set(m.curso_id, m.cursos) })
  const cursos = [...vistos.values()].sort((a, b) => a.anio - b.anio || a.division.localeCompare(b.division))
  if (!cursos.length) { app.innerHTML = `<h1>Asistencia</h1><p class="muted">Todavía no tenés cursos asignados.</p>`; return }
  const anios = [...new Set(cursos.map((c) => c.anio))]

  app.innerHTML = `<div class="head"><h1>Asistencia</h1><button class="btn y" id="send">Enviar</button></div><div class="card">
  <div class="tools"><label>Año <select id="anio">${anios.map((a) => `<option value="${a}">${a}°</option>`).join('')}</select></label>
  <label>División <select id="cur"></select></label>
  <label>Fecha <input type="date" id="fec" value="${hoy()}" max="${hoy()}"></label><button class="btn" id="all">Todos presentes</button></div>
  <div class="tbl"><table><thead><tr><th>Alumno</th><th>Presente / Ausente / Tarde</th></tr></thead><tbody id="tb"></tbody></table></div><div class="summary" id="sum" style="margin-top:12px"></div></div>`

  let cur = {}
  const pintaDivs = () => {
    const prev = $('#cur', app).value
    $('#cur', app).innerHTML = cursos.filter((c) => c.anio == $('#anio', app).value).map((c) => `<option value="${c.id}">${c.division} — ${c.turno}</option>`).join('')
    if ([...$('#cur', app).options].some((o) => o.value === prev)) $('#cur', app).value = prev
    draw()
  }
  const draw = async () => {
    const cursoId = $('#cur', app).value, fecha = $('#fec', app).value
    const { data: als } = await supabase.from('alumnos').select('id, nombre, apellido').eq('curso_id', cursoId).eq('activo', true).order('apellido')
    const { data: prev } = await supabase.from('asistencias').select('alumno_id, estado').eq('fecha', fecha).in('alumno_id', (als || []).map((a) => a.id))
    cur = Object.fromEntries((als || []).map((a) => [a.id, 'P']))
    ;(prev || []).forEach((r) => { cur[r.alumno_id] = r.estado })
    $('#tb', app).innerHTML = (als || []).map((a) => `<tr><td>${esc(a.nombre)} ${esc(a.apellido)}</td><td><div class="seg" data-id="${a.id}">${[['P', 'Presente'], ['A', 'Ausente'], ['T', 'Tarde']].map(([v, l]) => `<button type="button" data-v="${v}" title="${l}"><span class="l">${l}</span><span class="s">${v}</span></button>`).join('')}</div></td></tr>`).join('') || '<tr><td class="muted">Este curso no tiene alumnos activos.</td></tr>'
    paint()
  }
  const paint = () => {
    $$('.seg', app).forEach((s) => $$('button', s).forEach((b) => b.classList.toggle('on', b.dataset.v === cur[s.dataset.id])))
    const c = (v) => Object.values(cur).filter((x) => x === v).length
    $('#sum', app).innerHTML = `<span>Presentes: ${c('P')}</span><span class="neg">Ausentes: ${c('A')}</span><span>Tardes: ${c('T')}</span>`
  }

  app.addEventListener('click', (e) => {
    const b = e.target.closest?.('.seg button')
    if (b) { cur[b.parentNode.dataset.id] = b.dataset.v; paint() }
  })
  $('#anio', app).onchange = pintaDivs
  $('#cur', app).onchange = draw
  $('#fec', app).onchange = draw
  $('#all', app).onclick = () => { Object.keys(cur).forEach((k) => (cur[k] = 'P')); paint() }
  $('#send', app).onclick = async () => {
    const fecha = $('#fec', app).value
    if (!fecha) return toast('Elegí una fecha válida.', true)
    const ids = Object.keys(cur).map(Number)
    await supabase.from('asistencias').delete().eq('fecha', fecha).in('alumno_id', ids)
    const { error } = await supabase.from('asistencias').insert(ids.map((id) => ({ alumno_id: id, fecha, estado: cur[id] })))
    if (error) return toast(error.message, true)
    toast('Asistencia enviada')
  }
  pintaDivs()
}
