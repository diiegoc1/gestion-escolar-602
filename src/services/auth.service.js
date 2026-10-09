import { supabase } from '../lib/supabase.js'

// Producción (opción A): Supabase Auth + tabla usuarios vinculada por auth_id.
// Flujo: signInWithPassword -> busca fila en usuarios por auth_id,
// si no tiene auth_id la vincula por email (migración), guarda rol en localStorage.

export async function signIn(email, password) {
  const cleanEmail = (email || '').trim()
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  })
  if (authError) return { data: null, error: authError }

  const user = authData.user
  if (!user) return { data: null, error: new Error('Sin usuario en la sesión') }

  // 1) Buscar por auth_id
  let { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()

  // 2) Migración: si no está vinculada, buscar por email y vincular
  if (!perfil) {
    const { data: porEmail } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (!porEmail) {
      await supabase.auth.signOut()
      return { data: null, error: new Error('Cuenta Auth OK pero sin fila en usuarios. Pedí que te vinculen.') }
    }

    if (!porEmail.auth_id) {
      await supabase.from('usuarios').update({ auth_id: user.id }).eq('id', porEmail.id)
      perfil = { ...porEmail, auth_id: user.id }
    } else {
      await supabase.auth.signOut()
      return { data: null, error: new Error('Este email está vinculado a otra cuenta.') }
    }
  }

  localStorage.setItem('rol', perfil.rol)
  localStorage.setItem('usuario_id', perfil.id)
  localStorage.setItem('auth_id', user.id)
  localStorage.setItem('email', perfil.email)
  return { data: perfil, error: null }
}

export async function signOut() {
  localStorage.removeItem('rol')
  localStorage.removeItem('usuario_id')
  localStorage.removeItem('auth_id')
  localStorage.removeItem('email')
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

// Si hay sesión Auth pero se perdió localStorage, restaura rol.
export async function restoreSession() {
  if (localStorage.getItem('rol')) return true
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return false
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', session.user.id)
    .maybeSingle()
  if (!perfil) return false
  localStorage.setItem('rol', perfil.rol)
  localStorage.setItem('usuario_id', perfil.id)
  localStorage.setItem('auth_id', session.user.id)
  localStorage.setItem('email', perfil.email)
  return true
}

export function getRolLocal() {
  return localStorage.getItem('rol')
}
