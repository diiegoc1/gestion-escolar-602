// Componentes UI portados del diseño: toast, modal, shield, calendario.
import { $, $$, esc, MESES } from '../utils/helpers.js'

export function toast(msg, error = false) {
  const t = document.createElement('div')
  t.className = 'toast' + (error ? ' error' : '')
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2600)
}

export function modal(title, body, onOk, okText = 'Guardar') {
  const o = document.createElement('div')
  o.className = 'overlay'
  o.innerHTML = `<form class="modal" novalidate><h2>${title}</h2>${body}<p class="err" hidden></p><div class="acts"><button type="button" class="btn" data-x>Cancelar</button><button class="btn y">${okText}</button></div></form>`
  document.body.appendChild(o)
  const close = () => o.remove()
  $('[data-x]', o).onclick = close
  o.onclick = (e) => { if (e.target === o) close() }
  $('form', o).onsubmit = (e) => {
    e.preventDefault()
    const err = onOk(Object.fromEntries(new FormData(e.target)))
    if (err) { const p = $('.err', o); p.textContent = err; p.hidden = false }
    else close()
  }
  return o
}

export const shield = (w = 40) => `<svg width="${w}" height="${Math.round(w * 1.15)}" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1 38 7v17c0 10-8 18-18 21C10 42 2 34 2 24V7z" fill="#f5c518" stroke="#161616" stroke-width="2.5"/><path d="M20 1 38 7v17c0 10-8 18-18 21z" fill="#161616"/><text x="8" y="28" font-size="16" font-weight="800" fill="#161616" font-family="Arial">E</text><text x="22" y="28" font-size="16" font-weight="800" fill="#f5c518" font-family="Arial">P</text></svg>`

export function calendario(el, eventos = [], y = 2026, m = 9) {
  const draw = () => {
    const off = (new Date(y, m, 1).getDay() + 6) % 7
    const dias = new Date(y, m + 1, 0).getDate()
    let c = '<span></span>'.repeat(off)
    for (let d = 1; d <= dias; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const e = eventos.find((x) => (x.fecha_inicio || x.fecha) === iso)
      c += `<span class="${e ? 'ev ' + e.tipo : ''}" ${e ? `title="${esc(e.titulo)}"` : ''}>${d}</span>`
    }
    el.innerHTML = `<div class="calh"><h2>Calendario</h2><div><button class="btn sm" data-d="-1" aria-label="Mes anterior">&lt;</button> <b>${MESES[m]} ${y}</b> <button class="btn sm" data-d="1" aria-label="Mes siguiente">&gt;</button></div></div><div class="cal">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((x) => `<b>${x}</b>`).join('')}${c}</div>`
    $$('[data-d]', el).forEach((b) => (b.onclick = () => { m += +b.dataset.d; if (m < 0) { m = 11; y-- } if (m > 11) { m = 0; y++ } draw() }))
  }
  draw()
}

// Compat con stub anterior
export function openModal(contenido) { toast(contenido) }
