import { getAlumnos } from '../../services/alumnos.service.js'

export async function renderAlumnos(app) {
  const { data, error } = await getAlumnos()
  if (error) { app.innerHTML = `<p>Error: ${error.message}</p>`; return }
  app.innerHTML = `
    <h2>Alumnos</h2><a href="#/directivo">Volver</a>
    <table border="1"><thead><tr><th>DNI</th><th>Apellido</th><th>Nombre</th><th>Curso</th><th>Activo</th></tr></thead>
    <tbody>${data.map(a => `<tr><td>${a.dni}</td><td>${a.apellido}</td><td>${a.nombre}</td><td>${a.cursos ? `${a.cursos.anio}° ${a.cursos.division}` : a.curso_id ?? ''}</td><td>${a.activo ? 'Sí' : 'No'}</td></tr>`).join('')}</tbody></table>
  `
}
