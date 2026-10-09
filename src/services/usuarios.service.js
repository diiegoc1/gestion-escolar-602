import { supabase } from '../lib/supabase.js'

// Tabla real: usuarios(id, email, password_hash, rol DIRECTIVO/DOCENTE/ALUMNO)
// Login simple DEMO: compara password en claro contra password_hash.
// Para producción usar Supabase Auth + columna auth_id.
export async function getUsuarioByEmail(email) {
  return supabase.from('usuarios').select('*').eq('email', email).single()
}

export async function loginSimple(email, password) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return { data: null, error: error || new Error('Usuario no encontrado') }
  // DEMO simple: password_hash guarda la clave en claro en seed de prueba
  if (data.password_hash !== password) return { data: null, error: new Error('Contraseña incorrecta') }

  localStorage.setItem('rol', data.rol)
  localStorage.setItem('usuario_id', data.id)
  localStorage.setItem('email', data.email)
  return { data, error: null }
}

export function logoutSimple() {
  localStorage.removeItem('rol')
  localStorage.removeItem('usuario_id')
  localStorage.removeItem('email')
}

export async function getUsuarios() {
  return supabase.from('usuarios').select('id, email, rol')
}
