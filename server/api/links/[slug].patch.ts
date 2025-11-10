import { defineEventHandler, getHeader, readBody, sendError, createError } from 'h3'
import { prisma } from '../../db/prisma'
import { getRole } from '../../utils/role'
import { sanitizeHttpUrl } from '../../utils/url'

export default defineEventHandler(async (event) => {
  try {
    const slug = String(event.context.params?.slug || '').trim()
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'missing slug' })

    const body = await readBody<{ url?: string; title?: string | null; isActive?: boolean }>(event)
    if (typeof body?.url !== 'undefined') {
      const clean = sanitizeHttpUrl(body.url)
      if (!clean) throw createError({ statusCode: 400, statusMessage: 'invalid url' })
      body.url = clean
    }

    const link = await prisma.dqr_links.findFirst({ where: { slug } })
    if (!link) throw createError({ statusCode: 404, statusMessage: 'not found' })

    const username = getHeader(event, 'YNH_USER')
    const role = await getRole(event).catch(() => 'user' as const)
    if (role !== 'admin') {
      if (!username || link.ownerUsername !== username) {
        throw createError({ statusCode: 403, statusMessage: 'forbidden' })
      }
    }

    const payload: any = {}
    if (typeof body.url === 'string') payload.url = body.url
    if (typeof body.title !== 'undefined') payload.title = body.title?.trim() || null
    if (typeof body.isActive === 'boolean') payload.isActive = body.isActive
    if (Object.keys(payload).length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'no changes' })
    }
    const updated = await prisma.dqr_links.update({ where: { id: link.id }, data: payload })
    return updated
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }))
  }
})
