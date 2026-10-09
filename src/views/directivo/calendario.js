import { getEventos } from '../../services/eventos.service.js'

export async function renderCalendario(app) {
  const { data, error } = await getEventos()
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `<h2>Calendario — Eventos</h2><a href="#/directivo">Volver</a>
    <table border="1"><thead><tr><th>Título</th><th>Tipo</th><th>Inicio</th><th>Fin</th></tr></thead>
    <tbody>${data.map(e => `<tr><td>${e.titulo}</td><td>${e.tipo}</td><td>${e.fecha_inicio}</td><td>${e.fecha_fin ?? ''}</td></tr>`).join('')}</tbody></table>`
}
