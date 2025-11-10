import { prisma } from '../../db/prisma';
import { getRole } from '../../utils/role';
import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'invalid form' })

  const name = form.find(f => f.name === 'name')?.data?.toString() || ''
  const file = form.find(f => f.name === 'file' && f.type && f.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'file is required' })

  const dir = join(process.cwd(), 'public', 'uploads', 'brands')
  await fsp.mkdir(dir, { recursive: true })

  // If there is an existing brand, remove old image
  const existing = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  if (existing?.imageUrl) {
    try { await fsp.unlink(join(process.cwd(), 'public', existing.imageUrl)) } catch (_) {}
  }

  const safeName = `brand_${Date.now()}_${file.filename!.replace(/[^a-zA-Z0-9_.-]/g, '')}`
  const filePath = join(dir, safeName)
  await fsp.writeFile(filePath, file.data)
  const imageUrl = `/uploads/brands/${safeName}`

  let row
  if (existing) {
    row = await prisma.dqr_brands.update({ where: { id: existing.id }, data: { name: name || existing.name, imageUrl } })
  } else {
    row = await prisma.dqr_brands.create({ data: { name: name || 'Brand', imageUrl } })
  }

  return row
})

