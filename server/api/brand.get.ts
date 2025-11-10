import { prisma } from '../db/prisma';

export default defineEventHandler(async () => {
  const row = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  return row || null
})

