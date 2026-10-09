// Helpers UI portados del diseño (solo presentación, sin lógica de datos).
export const $ = (s, r = document) => r.querySelector(s)
export const $$ = (s, r = document) => [...r.querySelectorAll(s)]

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export const hoy = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10)

export const fmtFecha = (iso) => (iso || '').split('-').reverse().slice(0, 2).join('/')

export function formatoFecha(f) { return new Date(f).toLocaleDateString('es-AR') }

// Reglas de negocio (robadas del diseño, ajustables)
export const promedio = (n) => {
  const v = n.filter((x) => x != null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

export const estado = (p) =>
  p == null ? '-' : p >= 7 ? 'Aprobado' : p >= 6 ? 'Diciembre' : p >= 4 ? 'Febrero' : 'Previa'

export const nombreCurso = (c) => (c ? `${c.anio}° ${c.division}` : '')
