import { defineEventHandler, getHeader } from 'h3'
import { getRole } from '../utils/role'

export default defineEventHandler(async (event) => {
  const username = getHeader(event, 'YNH_USER') || null
  let role: 'admin' | 'user' | null = null
  try {
    role = await getRole(event)
  } catch (_) {
    // ignore failure; role may require LDAP auth
  }
  return { username, role }
})

