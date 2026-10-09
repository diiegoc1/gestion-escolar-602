import { supabase } from '../lib/supabase.js'

// Tabla: usuarios(id, email, password_hash, rol, auth_id uuid -> auth.users)
// password_hash queda legacy (demo). Producción usa Supabase Auth + auth_id.
export async function getUsuarioByEmail(email) {
  return supabase.from('usuarios').select('*').eq('email', (email || '').trim()).maybeSingle()
}

export async function getMiUsuario() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Sin sesión') }
  return supabase.from('usuarios').select('*').eq('auth_id', user.id).maybeSingle()
}

// DEMO legacy (sin Auth): solo desarrollo local. No usar en producción.
export async function loginSimple(email, password) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', (email || '').trim())
    .maybeSingle()

  if (error || !data) return { data: null, error: error || new Error('Usuario no encontrado') }
  if (data.password_hash !== password) return { data: null, error: new Error('Contraseña incorrecta') }

  localStorage.setItem('rol', data.rol)
  localStorage.setItem('usuario_id', data.id)
  localStorage.setItem('email', data.email)
  return { data, error: null }
}

export function logoutSimple() {
  localStorage.removeItem('rol')
  localStorage.removeItem('usuario_id')
  localStorage.removeItem('auth_id')
  localStorage.removeItem('email')
}

export async function getUsuarios() {
  return supabase.from('usuarios').select('id, email, rol')
}
