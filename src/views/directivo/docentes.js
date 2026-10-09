import { getDocentes } from '../../services/docentes.service.js'

export async function renderDocentes(app) {
  const { data, error } = await getDocentes()
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `
    <h2>Docentes</h2><a href="#/directivo">Volver</a>
    <table border="1"><thead><tr><th>DNI</th><th>Apellido</th><th>Nombre</th><th>Email</th></tr></thead>
    <tbody>${data.map(d => `<tr><td>${d.dni}</td><td>${d.apellido}</td><td>${d.nombre}</td><td>${d.email ?? ''}</td></tr>`).join('')}</tbody></table>
  `
}
