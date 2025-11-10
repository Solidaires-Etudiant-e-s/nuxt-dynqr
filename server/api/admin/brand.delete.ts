import { prisma } from '../../db/prisma';
import { getRole } from '../../utils/role';
import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  const existing = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  if (existing) {
    await prisma.dqr_brands.delete({ where: { id: existing.id } })
    if (existing.imageUrl) {
      try { await fsp.unlink(join(process.cwd(), 'public', existing.imageUrl)) } catch (_) {}
    }
  }
  return { ok: true }
})

