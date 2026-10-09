// Sidebar del diseño: links del menú por rol, marca el activo.
import { $$ } from '../utils/helpers.js'

export function renderSidebar(menu, hashActual) {
  const side = document.getElementById('side')
  if (!side) return
  side.innerHTML = menu.map(([t, r]) => `<a href="${r}" data-r="${r}" class="${r === hashActual ? 'on' : ''}">${t}</a>`).join('')
  $$('.side a').forEach((a) => (a.onclick = () => side.classList.remove('open')))
}
