import { supabase } from '../../lib/supabase.js'
import { getCursos } from '../../services/cursos.service.js'
import { $, $$, esc, nombreCurso } from '../../utils/helpers.js'
import { modal, toast } from '../../components/modal.js'

export async function renderAlumnos(app) {
  const { data: cursos } = await getCursos()
  let q = '', page = 1, bajas = false
  const PER = 10

  app.innerHTML = `<div class="head"><h1>Gestión de Alumnos</h1><button class="btn y" id="add">+ Agregar alumno</button></div>
  <div class="card"><div class="tools"><input id="q" type="search" placeholder="Buscar por DNI o apellido" aria-label="Buscar"><label><input type="checkbox" id="bj"> Ver bajas</label></div>
  <div class="tbl"><table><thead><tr><th>Nombre</th><th>DNI</th><th>Curso</th><th></th></tr></thead><tbody id="tb"></tbody></table></div><div class="pager" id="pg"></div></div>`

  const form = (a) => `<label>Nombre<input name="nombre" value="${esc(a?.nombre)}"></label><label>Apellido<input name="apellido" value="${esc(a?.apellido)}"></label>
    <label>DNI<input name="dni" inputmode="numeric" value="${esc(a?.dni)}"></label>
    <label>Curso<select name="curso_id">${(cursos || []).map((c) => `<option value="${c.id}" ${a?.curso_id === c.id ? 'selected' : ''}>${c.anio}° ${c.division} — ${c.turno}</option>`).join('')}</select></label>`

  const validar = (d, id, lista) => {
    if (!d.nombre.trim() || !d.apellido.trim()) return 'Completá nombre y apellido.'
    if (!/^\d{7,8}$/.test(d.dni)) return 'El DNI debe tener 7 u 8 dígitos.'
    if (lista.some((a) => a.dni === d.dni && a.id !== id)) return 'Ya existe un alumno con ese DNI.'
  }

  const draw = async () => {
    const { data: lista } = await supabase.from('alumnos').select('*, cursos(*)').order('apellido')
    const t = q.toLowerCase()
    const filtrada = (lista || []).filter((a) => (bajas ? !a.activo : a.activo))
      .filter((a) => !t || a.dni.includes(t) || a.apellido.toLowerCase().includes(t) || a.nombre.toLowerCase().includes(t))
    const pages = Math.max(1, Math.ceil(filtrada.length / PER))
    page = Math.min(page, pages)
    $('#tb', app).innerHTML = filtrada.slice((page - 1) * PER, page * PER).map((a) => `<tr class="${a.activo ? '' : 'baja'}"><td>${esc(a.nombre)} ${esc(a.apellido)}</td><td>${a.dni}</td><td>${esc(nombreCurso(a.cursos))}</td>
      <td class="acts">${a.activo ? `<button class="btn ic" data-e="${a.id}" aria-label="Editar">✎</button> <button class="btn ic del" data-b="${a.id}" aria-label="Dar de baja">🗑</button>` : `<button class="btn ic" data-r="${a.id}">Reactivar</button>`}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No hay alumnos que coincidan con la búsqueda.</td></tr>'
    $('#pg', app).innerHTML = `<span class="muted">${filtrada.length} alumnos</span><button class="btn sm" id="pp" ${page < 2 ? 'disabled' : ''}>&lt;</button> ${page} / ${pages} <button class="btn sm" id="pn" ${page >= pages ? 'disabled' : ''}>&gt;</button>`
    $('#pp', app).onclick = () => { page--; draw() }
    $('#pn', app).onclick = () => { page++; draw() }
    $$('[data-e]', app).forEach((b) => (b.onclick = async () => {
      const { data: a } = await supabase.from('alumnos').select('*').eq('id', b.dataset.e).single()
      modal('Editar alumno', form(a), (d) => {
        const e = validar(d, a.id, lista); if (e) return e
        supabase.from('alumnos').update({ nombre: d.nombre.trim(), apellido: d.apellido.trim(), dni: d.dni, curso_id: +d.curso_id }).eq('id', a.id)
          .then(({ error }) => { if (error) toast(error.message, true); else { toast('Alumno guardado'); draw() } })
      })
    }))
    $$('[data-b]', app).forEach((b) => (b.onclick = async () => {
      const { data: a } = await supabase.from('alumnos').select('nombre, apellido').eq('id', b.dataset.b).single()
      modal('Dar de baja', `<p>¿Dar de baja a <b>${esc(a.nombre)} ${esc(a.apellido)}</b>? Sus datos se conservan y podés reactivarlo.</p>`, () => {
        supabase.from('alumnos').update({ activo: false }).eq('id', b.dataset.b)
          .then(({ error }) => { if (error) toast(error.message, true); else { toast('Alumno dado de baja'); draw() } })
      }, 'Dar de baja')
    }))
    $$('[data-r]', app).forEach((b) => (b.onclick = async () => {
      await supabase.from('alumnos').update({ activo: true }).eq('id', b.dataset.r)
      toast('Alumno reactivado'); draw()
    }))
  }

  $('#q', app).oninput = (e) => { q = e.target.value.trim(); page = 1; draw() }
  $('#bj', app).onchange = (e) => { bajas = e.target.checked; page = 1; draw() }
  $('#add', app).onclick = () => modal('Agregar alumno', form(), (d) => {
    supabase.from('alumnos').select('dni').then(({ data: lista }) => {
      const e = validar(d, null, lista || []); if (e) { toast(e, true); return }
      supabase.from('alumnos').insert({ nombre: d.nombre.trim(), apellido: d.apellido.trim(), dni: d.dni, curso_id: +d.curso_id })
        .then(({ error }) => { if (error) toast(error.message, true); else { toast('Alumno agregado'); draw() } })
    })
  })
  draw()
}
