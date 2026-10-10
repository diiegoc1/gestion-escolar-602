import { supabase } from "../../lib/supabase.js";
import { $, $$, esc, nombreCurso } from "../../utils/helpers.js";
import { modal, toast } from "../../components/modal.js";

export async function renderMaterias(app) {
  let q = "",
    page = 1;
  const PER = 10;
  // Caché en memoria: se carga 1 vez, paginar/buscar no consulta a la BD
  let asignadas = [],
    todasMat = [],
    cursos = [],
    docs = [];

  app.innerHTML = `<div class="head"><h1>Gestión de Materias</h1><button class="btn y" id="add">+ Agregar materia</button></div>
  <div class="card"><div class="tools"><input id="q" type="search" placeholder="Buscar por materia, curso o titular" aria-label="Buscar"></div>
  <div class="tbl"><table><thead><tr><th>Materia</th><th>Curso</th><th>Titular</th><th></th></tr></thead><tbody id="tb"></tbody></table></div><div class="pager" id="pg"></div></div>`;

  const titularTxt = (d) => (d ? `${d.nombre} ${d.apellido}` : "");

  const formMateria = (
    m,
  ) => `<label>Nombre<input name="nombre" maxlength="60" value="${esc(m?.nombre)}"></label>
    <label>Año<select name="anio">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${m?.anio === n ? "selected" : ""}>${n}°</option>`).join("")}</select></label>`;

  const formAsignacion = (
    a,
    cursos,
    docs,
  ) => `<label>Curso<select name="curso_id">${(cursos || []).map((c) => `<option value="${c.id}" ${a?.curso_id === c.id ? "selected" : ""}>${esc(nombreCurso(c))}</option>`).join("")}</select></label>
    <label>Titular<select name="docente_id"><option value="">Sin titular</option>${(docs || []).map((d) => `<option value="${d.id}" ${a?.docente_id === d.id ? "selected" : ""}>${esc(d.nombre)} ${esc(d.apellido)}</option>`).join("")}</select></label>`;

  // 1. Fetch (solo al entrar y tras mutaciones)
  const load = async () => {
    const [r1, r2, r3, r4] = await Promise.all([
      supabase
        .from("materias_curso")
        .select(
          "id, materia_id, curso_id, docente_id, materias(id, nombre, anio), cursos(id, anio, division), docentes(id, nombre, apellido)",
        ),
      supabase.from("materias").select("*").order("anio").order("nombre"),
      supabase
        .from("cursos")
        .select("id, anio, division")
        .order("anio")
        .order("division"),
      supabase
        .from("docentes")
        .select("id, nombre, apellido")
        .order("apellido"),
    ]);
    if (r1.error) {
      $("#tb", app).innerHTML =
        `<tr><td colspan="4">Error: ${esc(r1.error.message)}</td></tr>`;
      return;
    }
    asignadas = r1.data || [];
    todasMat = r2.data || [];
    cursos = r3.data || [];
    docs = r4.data || [];
    render();
  };

  // 2. Render solo con memoria (sin consultas)
  const render = () => {
    const ord = [...asignadas].sort(
      (x, y) =>
        (x.cursos?.anio ?? 99) - (y.cursos?.anio ?? 99) ||
        String(x.cursos?.division ?? "").localeCompare(
          String(y.cursos?.division ?? ""),
        ) ||
        String(x.materias?.nombre ?? "").localeCompare(
          String(y.materias?.nombre ?? ""),
        ),
    );

    const asignIds = new Set(asignadas.map((a) => a.materia_id));
    const sinAsignar = todasMat
      .filter((m) => !asignIds.has(m.id))
      .map((m) => ({
        _sin: true,
        id: `m${m.id}`,
        materia_id: m.id,
        materias: m,
      }));

    const t = q.toLowerCase();
    const textoDe = (f) =>
      f._sin
        ? `${f.materias?.nombre || ""}`
        : `${f.materias?.nombre || ""} ${f.cursos ? `${f.cursos.anio} ${f.cursos.division}` : ""} ${titularTxt(f.docentes)}`;
    const filtrada = [...ord, ...sinAsignar].filter(
      (f) => !t || textoDe(f).toLowerCase().includes(t),
    );

    const pages = Math.max(1, Math.ceil(filtrada.length / PER));
    page = Math.min(page, pages);
    $("#tb", app).innerHTML =
      filtrada
        .slice((page - 1) * PER, page * PER)
        .map((f) => {
          if (f._sin)
            return `<tr><td>${esc(f.materias?.nombre)}</td><td class="muted">Sin asignar</td><td class="muted">—</td>
        <td class="acts"><button class="btn ic" data-em="${f.materia_id}" aria-label="Editar materia">✎</button> <button class="btn ic del" data-bm="${f.materia_id}" aria-label="Eliminar materia">🗑</button></td></tr>`;
          const tit = f.docentes
            ? esc(`${f.docentes.nombre} ${f.docentes.apellido}`)
            : '<span class="muted">Sin titular</span>';
          return `<tr><td>${esc(f.materias?.nombre)}</td><td><b>${esc(nombreCurso(f.cursos))}</b></td><td>${tit}</td>
        <td class="acts"><button class="btn ic" data-ea="${f.id}" aria-label="Editar asignación">✎</button> <button class="btn ic del" data-ba="${f.id}" aria-label="Quitar asignación">🗑</button></td></tr>`;
        })
        .join("") ||
      '<tr><td colspan="4" class="muted">No hay materias que coincidan con la búsqueda.</td></tr>';
    $("#pg", app).innerHTML =
      `<span class="muted">${filtrada.length} materias</span><button class="btn sm" id="pp" ${page < 2 ? "disabled" : ""}>&lt;</button> ${page} / ${pages} <button class="btn sm" id="pn" ${page >= pages ? "disabled" : ""}>&gt;</button>`;
    $("#pp", app).onclick = () => {
      page--;
      render();
    };
    $("#pn", app).onclick = () => {
      page++;
      render();
    };

    // Editar asignación: cambiar curso + titular
    $$("[data-ea]", app).forEach(
      (b) =>
        (b.onclick = async () => {
          const a = asignadas.find(
            (x) => String(x.id) === String(b.dataset.ea),
          );
          modal(`Editar asignación`, formAsignacion(a, cursos, docs), (f) => {
            if (!f.curso_id) return "Elegí el curso.";
            if (
              asignadas.some(
                (r) =>
                  r.id !== a.id &&
                  r.materia_id === a.materia_id &&
                  String(r.curso_id) === String(f.curso_id),
              )
            )
              return "Esa materia ya está asignada a ese curso.";
            supabase
              .from("materias_curso")
              .update({
                curso_id: +f.curso_id,
                docente_id: f.docente_id ? +f.docente_id : null,
              })
              .eq("id", a.id)
              .then(({ error }) => {
                if (error) toast(error.message, true);
                else {
                  toast("Asignación guardada");
                  load();
                }
              });
          });
        }),
    );

    // Quitar asignación (no borra la materia base)
    $$("[data-ba]", app).forEach(
      (b) =>
        (b.onclick = async () => {
          const reg = asignadas.find(
            (x) => String(x.id) === String(b.dataset.ba),
          );
          modal(
            "Quitar asignación",
            `<p>¿Quitar <b>${esc(reg?.materias?.nombre)}</b> de <b>${esc(nombreCurso(reg?.cursos))}</b>? La materia se conserva como sin asignar.</p>`,
            () => {
              supabase
                .from("materias_curso")
                .delete()
                .eq("id", b.dataset.ba)
                .then(({ error }) => {
                  if (error) toast(error.message, true);
                  else {
                    toast("Asignación eliminada");
                    load();
                  }
                });
            },
            "Quitar",
          );
        }),
    );

    // Editar / eliminar materia sin asignar
    $$("[data-em]", app).forEach(
      (b) =>
        (b.onclick = async () => {
          const m = todasMat.find((x) => String(x.id) === String(b.dataset.em));
          modal("Editar materia", formMateria(m), (f) => {
            if (!f.nombre.trim()) return "Ingresá el nombre de la materia.";
            if (
              todasMat.some(
                (x) =>
                  x.id !== m.id &&
                  x.nombre.toLowerCase() === f.nombre.trim().toLowerCase() &&
                  Number(x.anio) === +f.anio,
              )
            )
              return "Ya existe esa materia en ese año.";
            supabase
              .from("materias")
              .update({ nombre: f.nombre.trim(), anio: +f.anio })
              .eq("id", m.id)
              .then(({ error }) => {
                if (error) toast(error.message, true);
                else {
                  toast("Materia guardada");
                  load();
                }
              });
          });
        }),
    );
    $$("[data-bm]", app).forEach(
      (b) =>
        (b.onclick = async () => {
          const m = todasMat.find((x) => String(x.id) === String(b.dataset.bm));
          modal(
            "Eliminar materia",
            `<p>¿Eliminar <b>${esc(m?.nombre)}</b>?</p>`,
            () => {
              supabase
                .from("materias")
                .delete()
                .eq("id", b.dataset.bm)
                .then(({ error }) => {
                  if (error) toast(error.message, true);
                  else {
                    toast("Materia eliminada");
                    load();
                  }
                });
            },
            "Eliminar",
          );
        }),
    );
  };

  // 3. Buscador con debounce: no consulta, solo re-renderiza
  let tId;
  $("#q", app).oninput = (e) => {
    clearTimeout(tId);
    tId = setTimeout(() => {
      q = e.target.value.trim();
      page = 1;
      render();
    }, 250);
  };

  // Agregar: crear y asignar en un paso
  $("#add", app).onclick = async () => {
    modal(
      "Agregar materia",
      `<label>Materia existente<select name="materia_id"><option value="">— Nueva materia —</option>${todasMat.map((m) => `<option value="${m.id}">${esc(m.nombre)} (${m.anio}°)</option>`).join("")}</select></label>
    <label>Nombre nueva materia<input name="nombre" maxlength="60" placeholder="Solo si es nueva"></label>
    <label>Año<select name="anio">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}">${n}°</option>`).join("")}</select></label>
    <label>Curso<select name="curso_id">${cursos.map((c) => `<option value="${c.id}">${esc(nombreCurso(c))}</option>`).join("")}</select></label>
    <label>Titular<select name="docente_id"><option value="">Sin titular</option>${docs.map((d) => `<option value="${d.id}">${esc(d.nombre)} ${esc(d.apellido)}</option>`).join("")}</select></label>`,
      (f) => {
        const asignar = (materiaId) => {
          if (!f.curso_id) return "Elegí el curso.";
          if (
            asignadas.some(
              (r) =>
                String(r.materia_id) === String(materiaId) &&
                String(r.curso_id) === String(f.curso_id),
            )
          )
            return "Esa materia ya está asignada a ese curso.";
          supabase
            .from("materias_curso")
            .insert({
              materia_id: +materiaId,
              curso_id: +f.curso_id,
              docente_id: f.docente_id ? +f.docente_id : null,
            })
            .then(({ error }) => {
              if (error) toast(error.message, true);
              else {
                toast("Materia asignada");
                load();
              }
            });
        };
        if (f.materia_id) return asignar(f.materia_id);
        if (!f.nombre.trim())
          return "Ingresá el nombre o elegí una materia existente.";
        if (
          todasMat.some(
            (m) =>
              m.nombre.toLowerCase() === f.nombre.trim().toLowerCase() &&
              Number(m.anio) === +f.anio,
          )
        )
          return "Ya existe esa materia en ese año.";
        supabase
          .from("materias")
          .insert({ nombre: f.nombre.trim(), anio: +f.anio })
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) {
              toast(error.message, true);
              return;
            }
            asignar(data.id);
          });
      },
    );
  };
  load();
}
