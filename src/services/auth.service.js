import { supabase } from '../lib/supabase.js'
import { loginSimple, logoutSimple } from './usuarios.service.js'

// Login simple contra tabla usuarios (DEMO). Mantiene compat con Supabase Auth.
export async function signIn(email, password) {
  return loginSimple(email, password)
}

export async function signOut() {
  logoutSimple()
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function getRolLocal() {
  return localStorage.getItem('rol')
}
