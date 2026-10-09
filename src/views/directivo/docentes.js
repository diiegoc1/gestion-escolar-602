import { supabase } from '../../lib/supabase.js'
import { $, $$, esc } from '../../utils/helpers.js'
import { modal, toast } from '../../components/modal.js'

export async function renderDocentes(app) {
  let q = '', page = 1
  const PER = 10
  app.innerHTML = `<div class="head"><h1>Gestión de Docentes</h1><button class="btn y" id="add">+ Agregar docente</button></div>
  <div class="card"><div class="tools"><input id="q" type="search" placeholder="Buscar por nombre, email o materia" aria-label="Buscar"></div>
  <div class="tbl"><table><thead><tr><th>Nombre</th><th>Email</th><th>Materias que dicta</th><th></th></tr></thead><tbody id="tb"></tbody></table></div><div class="pager" id="pg"></div></div>`

  const form = (d) => `<label>Nombre<input name="nombre" value="${esc(d?.nombre)}"></label><label>Apellido<input name="apellido" value="${esc(d?.apellido)}"></label>
    <label>DNI<input name="dni" inputmode="numeric" value="${esc(d?.dni)}"></label>
    <label>Email<input name="email" type="email" value="${esc(d?.email)}"></label>
    <label>Teléfono<input name="telefono" value="${esc(d?.telefono)}"></label>`

  const validar = (f, id, lista) => {
    if (!f.nombre.trim() || !f.apellido.trim()) return 'Completá nombre y apellido.'
    if (!/^\d{7,8}$/.test(f.dni || '')) return 'El DNI debe tener 7 u 8 dígitos.'
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return 'Ingresá un email válido.'
    if ((lista || []).some((d) => d.dni === f.dni && d.id !== id)) return 'Ya existe un docente con ese DNI.'
  }

  const draw = async () => {
    const [{ data: docs }, { data: mc }] = await Promise.all([
      supabase.from('docentes').select('*').order('apellido'),
      supabase.from('materias_curso').select('docente_id, materias(nombre), cursos(anio, division)'),
    ])
    const porDoc = {}
    ;(mc || []).forEach((r) => {
      if (!r.docente_id) return
      ;(porDoc[r.docente_id] ??= []).push(`${r.materias?.nombre} — ${r.cursos?.anio}° ${r.cursos?.division}`)
    })
    const t = q.toLowerCase()
    const list = (docs || []).filter((d) => !t || `${d.nombre} ${d.apellido} ${d.email || ''} ${(porDoc[d.id] || []).join(' ')}`.toLowerCase().includes(t))
    const pages = Math.max(1, Math.ceil(list.length / PER))
    page = Math.min(page, pages)
    $('#tb', app).innerHTML = list.slice((page - 1) * PER, page * PER).map((d) => `<tr><td>${esc(d.nombre)} ${esc(d.apellido)}</td><td>${esc(d.email)}</td>
      <td class="mats">${(porDoc[d.id] || []).map((m) => `<span class="chip">${esc(m)}</span>`).join('') || '<span class="muted">Sin materias asignadas</span>'}</td>
      <td class="acts"><button class="btn ic" data-e="${d.id}" aria-label="Editar">✎</button> <button class="btn ic del" data-b="${d.id}" aria-label="Eliminar">🗑</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">No hay docentes que coincidan con la búsqueda.</td></tr>'
    $('#pg', app).innerHTML = `<span class="muted">${list.length} docentes</span><button class="btn sm" id="pp" ${page < 2 ? 'disabled' : ''}>&lt;</button> ${page} / ${pages} <button class="btn sm" id="pn" ${page >= pages ? 'disabled' : ''}>&gt;</button>`
    $('#pp', app).onclick = () => { page--; draw() }
    $('#pn', app).onclick = () => { page++; draw() }
    $$('[data-e]', app).forEach((b) => (b.onclick = async () => {
      const { data: d } = await supabase.from('docentes').select('*').eq('id', b.dataset.e).single()
      modal('Editar docente', form(d), (f) => {
        const e = validar(f, d.id, docs); if (e) return e
        supabase.from('docentes').update({ nombre: f.nombre.trim(), apellido: f.apellido.trim(), dni: f.dni, email: f.email.trim() || null, telefono: f.telefono.trim() || null }).eq('id', d.id)
          .then(({ error }) => { if (error) toast(error.message, true); else { toast('Docente guardado'); draw() } })
      })
    }))
    $$('[data-b]', app).forEach((b) => (b.onclick = () => {
      modal('Eliminar docente', `<p>¿Eliminar este docente? Sus materias quedarán sin docente asignado.</p>`, () => {
        supabase.from('materias_curso').update({ docente_id: null }).eq('docente_id', b.dataset.b).then(async () => {
          const { error } = await supabase.from('docentes').delete().eq('id', b.dataset.b)
          if (error) toast(error.message, true); else { toast('Docente eliminado'); draw() }
        })
      }, 'Eliminar')
    }))
  }

  $('#q', app).oninput = (e) => { q = e.target.value.trim(); page = 1; draw() }
  $('#add', app).onclick = () => modal('Agregar docente', form(), (f) => {
    supabase.from('docentes').select('id, dni').then(({ data: lista }) => {
      const e = validar(f, null, lista || []); if (e) { toast(e, true); return }
      supabase.from('docentes').insert({ nombre: f.nombre.trim(), apellido: f.apellido.trim(), dni: f.dni, email: f.email.trim() || null, telefono: f.telefono.trim() || null })
        .then(({ error }) => { if (error) toast(error.message, true); else { toast('Docente agregado'); draw() } })
    })
  })
  draw()
}
