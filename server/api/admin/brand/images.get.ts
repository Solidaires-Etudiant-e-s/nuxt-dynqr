import { prisma } from '../../../db/prisma';
import { getRole } from '../../../utils/role';

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  const brand = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  if (!brand) return []
  const rows = await prisma.dqr_brand_images.findMany({ where: { brandId: brand.id }, orderBy: { id: 'desc' } })
  return rows
})

