import { prisma } from '../../../db/prisma';
import { getRole } from '../../../utils/role';
import { promises as fsp } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const role = await getRole(event)
  if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' })

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'invalid form' })

  // Ensure brand row exists
  let brand = await prisma.dqr_brands.findFirst({ orderBy: { id: 'asc' } })
  if (!brand) brand = await prisma.dqr_brands.create({ data: { name: 'Brand', imageUrl: '' } })

  const files = form.filter(f => f.name === 'files' && f.type && f.filename)
  if (!files.length) throw createError({ statusCode: 400, statusMessage: 'no files' })

  const dir = join(process.cwd(), 'public', 'uploads', 'brands')
  await fsp.mkdir(dir, { recursive: true })

  const created: any[] = []
  for (const file of files) {
    const safeName = `brandimg_${Date.now()}_${file.filename!.replace(/[^a-zA-Z0-9_.-]/g, '')}`
    const filePath = join(dir, safeName)
    await fsp.writeFile(filePath, file.data)
    const imageUrl = `/uploads/brands/${safeName}`
    const row = await prisma.dqr_brand_images.create({ data: { brandId: brand.id, imageUrl } })
    created.push(row)
  }

  return created
})

