import { supabase } from '../../lib/supabase.js'
import { getEventos } from '../../services/eventos.service.js'
import { $, $$, esc, fmtFecha, hoy } from '../../utils/helpers.js'
import { modal, toast, calendario } from '../../components/modal.js'

const TIPOS = { acto: 'Acto escolar', examen: 'Mesa de examen', feriado: 'Feriado', institucional: 'Institucional' }
const CLASE = { acto: 'acto', examen: 'mesa', feriado: 'cierre', institucional: 'tec' }

export async function renderCalendario(app) {
  app.innerHTML = `<h1>Calendario</h1>
  <div class="grid2"><section class="card"><h2>Nuevo evento</h2><form id="f" novalidate>
    <div class="tools"><label>Inicio <input type="date" id="fi" value="${hoy()}"></label>
    <label>Fin <input type="date" id="ff"></label>
    <label>Tipo <select id="ti">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label></div>
    <div class="tools"><label style="flex:1">Título <input id="tt" maxlength="80" placeholder="Ej: Acto del 17 de agosto" style="width:100%"></label></div>
    <p class="err" id="er" hidden></p><button class="btn y">Registrar evento</button></form>
    <h2 style="margin-top:18px">Eventos registrados</h2><ul class="events" id="ls"></ul></section>
    <section class="card" id="cal"></section></div>`

  const draw = async () => {
    const { data: ev, error } = await getEventos()
    if (error) { $('#ls', app).innerHTML = `<li class="muted">Error: ${esc(error.message)}</li>`; return }
    const lista = [...(ev || [])].sort((a, b) => (a.fecha_inicio < b.fecha_inicio ? -1 : 1))
    $('#ls', app).innerHTML = lista.map((e) => `<li><i class="sq ${CLASE[e.tipo] || ''}"></i><span style="flex:1"><b>${fmtFecha(e.fecha_inicio)}</b> ${esc(e.titulo)} <small class="muted">· ${TIPOS[e.tipo] || e.tipo}</small></span><button class="btn ic del" data-d="${e.id}" aria-label="Eliminar evento">🗑</button></li>`).join('') || '<li class="muted">No hay eventos registrados.</li>'
    $$('[data-d]', app).forEach((b) => (b.onclick = async () => {
      const { data: e } = await supabase.from('eventos').select('titulo').eq('id', b.dataset.d).single()
      modal('Eliminar evento', `<p>¿Eliminar <b>${esc(e?.titulo)}</b>?</p>`, () => {
        supabase.from('eventos').delete().eq('id', b.dataset.d).then(({ error }) => {
          if (error) toast(error.message, true); else { toast('Evento eliminado'); draw() }
        })
      }, 'Eliminar')
    }))
    calendario($('#cal', app), lista)
  }

  $('#f', app).onsubmit = async (e) => {
    e.preventDefault()
    const er = $('#er', app), inicio = $('#fi', app).value, titulo = $('#tt', app).value.trim()
    const fail = (m) => { er.textContent = m; er.hidden = false }
    if (!inicio) return fail('Elegí una fecha.')
    if (!titulo) return fail('Ingresá un título.')
    er.hidden = true
    const { error } = await supabase.from('eventos').insert({ titulo, tipo: $('#ti', app).value, fecha_inicio: inicio, fecha_fin: $('#ff', app).value || null })
    if (error) return fail(error.message)
    $('#tt', app).value = ''; $('#ff', app).value = ''
    toast('Evento registrado'); draw()
  }
  draw()
}
