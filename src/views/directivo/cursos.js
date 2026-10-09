import { supabase } from '../../lib/supabase.js'
import { getCursos } from '../../services/cursos.service.js'
import { contarAlumnosPorCurso } from '../../services/consultas.service.js'
import { $, $$, esc } from '../../utils/helpers.js'
import { modal, toast } from '../../components/modal.js'

export async function renderCursos(app) {
  app.innerHTML = `<div class="head"><h1>Gestión de Cursos</h1><button class="btn y" id="add">+ Agregar curso</button></div>
  <div class="card"><div class="tbl"><table><thead><tr><th>Curso</th><th>Turno</th><th>Alumnos</th><th>Materias sin docente</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`

  const draw = async () => {
    const { data: cursos, error } = await getCursos()
    if (error) { $('#tb', app).innerHTML = `<tr><td colspan="5">Error: ${esc(error.message)}</td></tr>`; return }
    let filas = ''
    for (const c of cursos || []) {
      const { count } = await contarAlumnosPorCurso(c.id)
      const { data: sin } = await supabase.from('materias_curso').select('id', { count: 'exact', head: true }).eq('curso_id', c.id).is('docente_id', null)
      filas += `<tr><td><b>${c.anio}° ${esc(c.division)}</b></td><td>${esc(c.turno)}</td><td>${count ?? '?'}</td><td class="${sin ? '' : 'muted'}">${sin ?? '?'}</td>
        <td class="acts"><button class="btn ic" data-m="${c.id}">Materias</button> <button class="btn ic" data-e="${c.id}" aria-label="Editar turno">✎</button></td></tr>`
    }
    $('#tb', app).innerHTML = filas

    $$('[data-e]', app).forEach((b) => (b.onclick = async () => {
      const { data: c } = await supabase.from('cursos').select('*').eq('id', b.dataset.e).single()
      modal(`Editar ${c.anio}° ${c.division}`, `<label>Turno<select name="turno">${['Mañana', 'Tarde', 'Noche'].map((t) => `<option ${c.turno === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label>Ciclo lectivo<input name="ciclo_lectivo" type="number" value="${c.ciclo_lectivo}"></label>`, (f) => {
        supabase.from('cursos').update({ turno: f.turno, ciclo_lectivo: +f.ciclo_lectivo }).eq('id', c.id)
          .then(({ error }) => { if (error) toast(error.message, true); else { toast('Curso guardado'); draw() } })
      })
    }))

    $$('[data-m]', app).forEach((b) => (b.onclick = async () => {
      const { data: ms } = await supabase.from('materias_curso').select('*, materias(nombre)').eq('curso_id', b.dataset.m)
      const { data: docs } = await supabase.from('docentes').select('id, nombre, apellido').order('apellido')
      const c = (cursos || []).find((x) => x.id == b.dataset.m)
      modal(`Materias de ${c.anio}° ${c.division}`, (ms || []).map((m) => `<label>${esc(m.materias?.nombre)}<select name="m${m.id}"><option value="">Sin docente</option>${(docs || []).map((d) => `<option value="${d.id}" ${m.docente_id === d.id ? 'selected' : ''}>${esc(d.apellido)}, ${esc(d.nombre)}</option>`).join('')}</select></label>`).join('') || '<p class="muted">Este curso no tiene materias.</p>', (f) => {
        Promise.all((ms || []).map((m) => supabase.from('materias_curso').update({ docente_id: f['m' + m.id] || null }).eq('id', m.id)))
          .then(() => { toast('Docentes asignados'); draw() })
      })
    }))
  }

  $('#add', app).onclick = () => modal('Agregar curso', `<label>Año<select name="anio">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}">${n}°</option>`).join('')}</select></label>
    <label>División<input name="division" maxlength="2"></label>
    <label>Turno<select name="turno"><option>Mañana</option><option>Tarde</option><option>Noche</option></select></label>
    <label>Ciclo lectivo<input name="ciclo_lectivo" type="number" value="${new Date().getFullYear()}"></label>`, (f) => {
    if (!f.division.trim()) return 'Ingresá la división.'
    supabase.from('cursos').insert({ anio: +f.anio, division: f.division.trim(), turno: f.turno, ciclo_lectivo: +f.ciclo_lectivo })
      .then(({ error }) => { if (error) toast(error.message, true); else { toast('Curso agregado'); draw() } })
  })
  draw()
}
