import { prisma } from '../../db/prisma';
import { getRole } from '../../utils/role';

function isHexColor(v: string) { return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) }

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  const body = await readBody(event)
  const data: any = {}
  if (typeof body?.name === 'string') data.name = body.name
  if (typeof body?.fgColor === 'string' && isHexColor(body.fgColor)) data.fgColor = body.fgColor
  if (typeof body?.bgColor === 'string' && isHexColor(body.bgColor)) data.bgColor = body.bgColor

  let existing = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  if (!existing) {
    existing = await prisma.dqr_brands.create({ data: { name: data.name || 'Brand', imageUrl: '', fgColor: data.fgColor, bgColor: data.bgColor } })
  } else if (Object.keys(data).length) {
    existing = await prisma.dqr_brands.update({ where: { id: existing.id }, data })
  }

  return existing
})

