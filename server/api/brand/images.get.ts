import { prisma } from '../../../server/db/prisma'

export default defineEventHandler(async () => {
  const brand = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  if (!brand) return []
  const rows = await prisma.dqr_brand_images.findMany({ where: { brandId: brand.id }, orderBy: { id: 'desc' } })
  return rows
})

