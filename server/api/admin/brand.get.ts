import { prisma } from '../../db/prisma';
import { getRole } from '../../utils/role';

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  const row = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  return row || null
})

