import { supabase } from '../../lib/supabase.js'
import { getMateriasPorDocente } from '../../services/materias-curso.service.js'
import { $, $$, esc, promedio, estado } from '../../utils/helpers.js'
import { toast } from '../../components/modal.js'

export async function renderCargarNotas(app) {
  const usuarioId = localStorage.getItem('usuario_id')
  const { data: doc } = await supabase.from('docentes').select('id').eq('usuario_id', usuarioId).single()
  if (!doc) { app.innerHTML = `<h1>Carga de Notas</h1><p class="muted">Todavía no tenés docente vinculado.</p>`; return }
  const { data: mats, error } = await getMateriasPorDocente(doc.id)
  if (error) { app.innerHTML = `<p>Error: ${esc(error.message)}</p>`; return }
  if (!mats?.length) { app.innerHTML = `<h1>Carga de Notas</h1><p class="muted">Todavía no tenés materias asignadas.</p>`; return }

  const curso = (m) => m.cursos
  const anios = [...new Set(mats.map((m) => curso(m).anio))].sort((a, b) => a - b)
  app.innerHTML = `<h1>Carga de Notas</h1><div class="card"><div class="tools">
    <label>Año <select id="anio">${anios.map((a) => `<option value="${a}">${a}°</option>`).join('')}</select></label>
    <label>Materia <select id="mat"></select></label>
    <label>División <select id="div"></select></label></div>
  <div class="tbl"><table><thead><tr><th>Alumno</th><th>DNI</th><th>1° trim.</th><th>2° trim.</th><th>3° trim.</th><th>Promedio</th><th>Estado</th></tr></thead><tbody id="tb"></tbody></table></div>
  <div class="foot"><span class="muted">Notas de 1 a 10</span><button class="btn y" id="save">Guardar</button></div></div>`

  const fill = (sel, items, keep) => {
    sel.innerHTML = items.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join('')
    if (keep != null && items.some((i) => String(i[0]) === String(keep))) sel.value = keep
  }
  const delAnio = () => mats.filter((m) => curso(m).anio == $('#anio', app).value)
  const pintaMaterias = () => {
    fill($('#mat', app), [...new Set(delAnio().map((m) => m.materias.nombre))].sort().map((n) => [n, n]), $('#mat', app).value)
    pintaDivs()
  }
  const pintaDivs = () => {
    fill($('#div', app), delAnio().filter((m) => m.materias.nombre === $('#mat', app).value)
      .map((m) => [m.id, `${curso(m).division} — ${curso(m).turno}`]).sort((a, b) => (a[1] < b[1] ? -1 : 1)), $('#div', app).value)
    draw()
  }
  const calc = (tr) => {
    const v = $$('.nota', tr).map((i) => (i.value === '' ? null : +i.value))
    const p = promedio(v.filter((x) => x >= 1 && x <= 10))
    $('.prom', tr).textContent = p == null ? '-' : p.toFixed(2)
    const e = estado(p)
    $('.est', tr).innerHTML = p == null ? '-' : `<span class="badge ${e}">${e}</span>`
  }
  const draw = async () => {
    const mcId = $('#div', app).value
    const m = mats.find((x) => x.id == mcId)
    if (!m) { $('#tb', app).innerHTML = ''; return }
    const [{ data: als }, { data: notas }] = await Promise.all([
      supabase.from('alumnos').select('id, nombre, apellido, dni').eq('curso_id', m.curso_id).eq('activo', true).order('apellido'),
      supabase.from('calificaciones').select('alumno_id, trimestre, nota').eq('materia_curso_id', mcId),
    ])
    const mapa = {}
    ;(notas || []).forEach((n) => { (mapa[n.alumno_id] ??= {})[n.trimestre] = n.nota })
    $('#tb', app).innerHTML = (als || []).map((a) => {
      const n = [1, 2, 3].map((t) => mapa[a.id]?.[t] ?? null)
      return `<tr data-id="${a.id}"><td>${esc(a.nombre)} ${esc(a.apellido)}</td><td>${a.dni}</td>${n.map((x, i) => `<td><input class="nota" type="number" min="1" max="10" step="0.5" inputmode="decimal" value="${x ?? ''}" aria-label="Trimestre ${i + 1}"></td>`).join('')}<td class="prom"></td><td class="est"></td></tr>`
    }).join('')
    $$('#tb tr', app).forEach(calc)
  }

  $('#anio', app).onchange = pintaMaterias
  $('#mat', app).onchange = pintaDivs
  $('#div', app).onchange = draw
  app.addEventListener('input', (e) => {
    if (e.target.classList?.contains('nota')) {
      const v = e.target.value
      e.target.classList.toggle('bad', v !== '' && !(+v >= 1 && +v <= 10))
      calc(e.target.closest('tr'))
    }
  })
  $('#save', app).onclick = async () => {
    if ($$('.nota.bad', app).length) return toast('Hay notas fuera del rango 1 a 10.', true)
    const mcId = +$('#div', app).value
    const filas = $$('#tb tr', app).map((tr) => ({ id: +tr.dataset.id, notas: $$('.nota', tr).map((i) => (i.value === '' ? null : +i.value)) }))
    await supabase.from('calificaciones').delete().eq('materia_curso_id', mcId).in('alumno_id', filas.map((f) => f.id))
    const payload = []
    filas.forEach((f) => f.notas.forEach((n, i) => { if (n != null) payload.push({ alumno_id: f.id, materia_curso_id: mcId, trimestre: i + 1, nota: n }) }))
    if (payload.length) {
      const { error } = await supabase.from('calificaciones').insert(payload)
      if (error) return toast(error.message, true)
    }
    toast('Notas guardadas')
  }
  pintaMaterias()
}
