import { getPreviasConDetalle } from '../../services/consultas.service.js'

export async function renderConsultas(app) {
  const { data, error } = await getPreviasConDetalle()
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `<h2>Consultas — Previas</h2><a href="#/directivo">Volver</a>
    <table border="1"><thead><tr><th>Alumno</th><th>Materia</th><th>Detalle</th></tr></thead>
    <tbody>${data.map(p => `<tr><td>${p.alumnos?.apellido} ${p.alumnos?.nombre}</td><td>${p.materias_curso?.materias?.nombre ?? p.materia_curso_id}</td><td>${p.detalle ?? ''}</td></tr>`).join('')}</tbody></table>`
}
