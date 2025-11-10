import { defineEventHandler, getHeader, sendError, createError } from 'h3'
import { prisma } from '../../db/prisma'
import { getRole } from '../../utils/role'

export default defineEventHandler(async (event) => {
  try {
    const slug = String(event.context.params?.slug || '').trim()
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'missing slug' })

    const link = await prisma.dqr_links.findFirst({ where: { slug } })
    if (!link) throw createError({ statusCode: 404, statusMessage: 'not found' })

    const username = getHeader(event, 'YNH_USER')
    const role = await getRole(event).catch(() => 'user' as const)
    if (role !== 'admin') {
      if (!username || link.ownerUsername !== username) {
        throw createError({ statusCode: 403, statusMessage: 'forbidden' })
      }
    }

    return link
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }))
  }
})

