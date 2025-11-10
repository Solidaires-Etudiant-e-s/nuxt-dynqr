import { prisma } from '../../../../db/prisma';
import { getRole } from '../../../../utils/role';
import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  const img = await prisma.dqr_brand_images.findFirst({ where: { id } })
  const res = await prisma.dqr_brand_images.deleteMany({ where: { id } })
  if (res.count && img?.imageUrl) {
    try { await fsp.unlink(join(process.cwd(), 'public', img.imageUrl)) } catch (_) {}
  }
  return { deleted: res.count }
})

