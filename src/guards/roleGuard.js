// Roles en BD: DIRECTIVO / DOCENTE / ALUMNO (mayúsculas). Normaliza para comparar.
export function normalizeRol(rol) {
  return (rol || '').toString().trim().toUpperCase()
}

export function canAccess(rol, rolesPermitidos) {
  if (!rolesPermitidos) return true
  return rolesPermitidos.map(normalizeRol).includes(normalizeRol(rol))
}

export function requireRole(rol, rolesPermitidos) {
  if (!canAccess(rol, rolesPermitidos)) {
    window.location.hash = '#/login'
    return false
  }
  return true
}
